"""
Screenshot Segmentation and OCR Pipeline for LLM Context
Segments screenshots into meaningful regions and extracts text with spatial context
"""

import pytesseract
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
import cv2
from pathlib import Path


@dataclass
class TextRegion:
    """Represents a detected text region with its properties"""
    text: str
    bbox: Tuple[int, int, int, int]  # (x, y, width, height)
    confidence: float
    region_type: str  # 'header', 'body', 'menu', 'button', etc.
    
    @property
    def center(self) -> Tuple[int, int]:
        x, y, w, h = self.bbox
        return (x + w // 2, y + h // 2)


@dataclass
class ScreenshotContext:
    """Final output containing all extracted context"""
    text_regions: List[TextRegion]
    layout_description: str
    full_text: str
    llm_prompt: str
    metadata: Dict


class ScreenshotSegmentationPipeline:
    """
    Pipeline for processing screenshots to extract contextual information for LLMs
    """
    
    def __init__(self, 
                 min_confidence: float = 60.0,
                 merge_threshold: int = 20,
                 enable_preprocessing: bool = True):
        """
        Initialize the pipeline
        
        Args:
            min_confidence: Minimum OCR confidence threshold (0-100)
            merge_threshold: Pixel distance for merging nearby text regions
            enable_preprocessing: Whether to apply image preprocessing
        """
        self.min_confidence = min_confidence
        self.merge_threshold = merge_threshold
        self.enable_preprocessing = enable_preprocessing

    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image to improve OCR accuracy
        """
        if not self.enable_preprocessing:
            return image.convert('RGB')  # Ensure RGB mode
            
        # Convert to numpy array for OpenCV processing
        img_array = np.array(image)
        
        # Convert to grayscale
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array
            
        # Apply adaptive thresholding for better text contrast
        # This works well for screenshots with varying backgrounds
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(thresh)
        
        # Convert back to PIL Image in RGB mode for pytesseract compatibility
        pil_image = Image.fromarray(denoised)
        return pil_image.convert('RGB')
        
    # def preprocess_image(self, image: Image.Image) -> Image.Image:
    #     """
    #     Preprocess image to improve OCR accuracy
    #     """
    #     if not self.enable_preprocessing:
    #         return image
            
    #     # Convert to numpy array for OpenCV processing
    #     img_array = np.array(image)
        
    #     # Convert to grayscale
    #     if len(img_array.shape) == 3:
    #         gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    #     else:
    #         gray = img_array
            
    #     # Apply adaptive thresholding for better text contrast
    #     # This works well for screenshots with varying backgrounds
    #     thresh = cv2.adaptiveThreshold(
    #         gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
    #         cv2.THRESH_BINARY, 11, 2
    #     )
        
    #     # Denoise
    #     denoised = cv2.fastNlMeansDenoising(thresh)
        
    #     return Image.fromarray(denoised)
    
    def segment_layout(self, image: Image.Image) -> Dict[str, List[Tuple[int, int, int, int]]]:
        """
        Segment the screenshot into logical regions using contour detection
        
        Returns:
            Dictionary mapping region types to bounding boxes
        """
        img_array = np.array(image.convert('L'))
        
        # Edge detection to find UI elements
        edges = cv2.Canny(img_array, 50, 150)
        
        # Dilate to connect nearby edges
        kernel = np.ones((5, 5), np.uint8)
        dilated = cv2.dilate(edges, kernel, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(
            dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        
        # Classify regions based on position and size
        height, width = img_array.shape
        regions = {
            'header': [],
            'sidebar': [],
            'main': [],
            'footer': [],
            'other': []
        }
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            
            # Filter out very small regions (noise)
            if w < 30 or h < 20:
                continue
                
            # Classify based on position
            if y < height * 0.15 and w > width * 0.5:
                regions['header'].append((x, y, w, h))
            elif y > height * 0.85 and w > width * 0.5:
                regions['footer'].append((x, y, w, h))
            elif x < width * 0.25 and h > height * 0.3:
                regions['sidebar'].append((x, y, w, h))
            elif w > width * 0.3 and h > height * 0.3:
                regions['main'].append((x, y, w, h))
            else:
                regions['other'].append((x, y, w, h))
                
        return regions
    
    # def extract_text_regions(self, image: Image.Image) -> List[TextRegion]:
    #     """
    #     Extract text from image with bounding boxes and confidence scores
    #     """
    #     # Use pytesseract to get detailed data
    #     ocr_data = pytesseract.image_to_data(
    #         image, 
    #         output_type=pytesseract.Output.DICT,
    #         config='--psm 11'  # Sparse text with OSD
    #     )
        
    #     text_regions = []
    #     n_boxes = len(ocr_data['text'])
        
    #     for i in range(n_boxes):
    #         # Filter by confidence
    #         conf = float(ocr_data['conf'][i])
    #         if conf < self.min_confidence:
    #             continue
                
    #         text = ocr_data['text'][i].strip()
    #         if not text:
    #             continue
                
    #         # Extract bounding box
    #         x = ocr_data['left'][i]
    #         y = ocr_data['top'][i]
    #         w = ocr_data['width'][i]
    #         h = ocr_data['height'][i]
            
    #         # Determine region type based on text characteristics
    #         region_type = self._classify_text_region(text, w, h)
            
    #         text_regions.append(TextRegion(
    #             text=text,
    #             bbox=(x, y, w, h),
    #             confidence=conf,
    #             region_type=region_type
    #         ))
        
    #     return text_regions

    def extract_text_regions(self, image: Image.Image) -> List[TextRegion]:
        """
        Extract text from image with bounding boxes and confidence scores
        """
        # Ensure image is in RGB mode and make a copy to avoid issues
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Use pytesseract to get detailed data
        try:
            ocr_data = pytesseract.image_to_data(
                image, 
                output_type=pytesseract.Output.DICT,
            )
        except Exception as e:
            print(f"OCR Error: {e}")
        
        text_regions = []
        n_boxes = len(ocr_data['text'])
        
        for i in range(n_boxes):
            # Filter by confidence
            conf = float(ocr_data['conf'][i])
            if conf < self.min_confidence:
                continue
                
            text = ocr_data['text'][i].strip()
            if not text:
                continue
                
            # Extract bounding box
            x = ocr_data['left'][i]
            y = ocr_data['top'][i]
            w = ocr_data['width'][i]
            h = ocr_data['height'][i]
            
            # Determine region type based on text characteristics
            region_type = self._classify_text_region(text, w, h)
            
            text_regions.append(TextRegion(
                text=text,
                bbox=(x, y, w, h),
                confidence=conf,
                region_type=region_type
            ))
        
        return text_regions
    
    def _classify_text_region(self, text: str, width: int, height: int) -> str:
        """
        Classify text region based on content and size
        """
        text_lower = text.lower()
        
        # Button indicators
        if len(text) < 20 and any(word in text_lower for word in 
                                   ['submit', 'ok', 'cancel', 'save', 'delete', 'add']):
            return 'button'
        
        # Navigation/menu items
        if len(text) < 30 and any(word in text_lower for word in 
                                   ['home', 'settings', 'profile', 'menu', 'help']):
            return 'navigation'
        
        # Headers (short, possibly all caps)
        if len(text) < 50 and (text.isupper() or height > 20):
            return 'header'
        
        # Labels (short text near form elements)
        if len(text) < 30 and ':' in text:
            return 'label'
        
        # Body text (longer content)
        if len(text) > 50:
            return 'body'
        
        return 'text'
    
    def merge_nearby_regions(self, regions: List[TextRegion]) -> List[TextRegion]:
        """
        Merge text regions that are close together
        """
        if not regions:
            return regions
        
        # Sort by position (top to bottom, left to right)
        sorted_regions = sorted(regions, key=lambda r: (r.bbox[1], r.bbox[0]))
        
        merged = []
        current_group = [sorted_regions[0]]
        
        for region in sorted_regions[1:]:
            last = current_group[-1]
            
            # Check if regions are close enough to merge
            x1, y1, w1, h1 = last.bbox
            x2, y2, w2, h2 = region.bbox
            
            # Calculate distance between regions
            horizontal_gap = x2 - (x1 + w1)
            vertical_gap = y2 - (y1 + h1)
            
            # Merge if on same line or very close
            if (abs(y1 - y2) < h1 * 0.5 and horizontal_gap < self.merge_threshold) or \
               (abs(x1 - x2) < w1 * 0.5 and vertical_gap < self.merge_threshold):
                current_group.append(region)
            else:
                # Create merged region from group
                if current_group:
                    merged.append(self._merge_region_group(current_group))
                current_group = [region]
        
        # Don't forget the last group
        if current_group:
            merged.append(self._merge_region_group(current_group))
        
        return merged
    
    def _merge_region_group(self, group: List[TextRegion]) -> TextRegion:
        """
        Merge a group of text regions into one
        """
        if len(group) == 1:
            return group[0]
        
        # Combine text
        combined_text = ' '.join(r.text for r in group)
        
        # Calculate combined bounding box
        min_x = min(r.bbox[0] for r in group)
        min_y = min(r.bbox[1] for r in group)
        max_x = max(r.bbox[0] + r.bbox[2] for r in group)
        max_y = max(r.bbox[1] + r.bbox[3] for r in group)
        
        # Average confidence
        avg_conf = sum(r.confidence for r in group) / len(group)
        
        # Use most common region type
        region_types = [r.region_type for r in group]
        most_common_type = max(set(region_types), key=region_types.count)
        
        return TextRegion(
            text=combined_text,
            bbox=(min_x, min_y, max_x - min_x, max_y - min_y),
            confidence=avg_conf,
            region_type=most_common_type
        )
    
    def generate_layout_description(self, 
                                    text_regions: List[TextRegion],
                                    image_size: Tuple[int, int]) -> str:
        """
        Generate natural language description of the layout
        """
        width, height = image_size
        
        # Group regions by vertical position
        top_regions = [r for r in text_regions if r.bbox[1] < height * 0.2]
        middle_regions = [r for r in text_regions if height * 0.2 <= r.bbox[1] < height * 0.8]
        bottom_regions = [r for r in text_regions if r.bbox[1] >= height * 0.8]
        
        # Build description
        description_parts = []
        
        if top_regions:
            headers = [r for r in top_regions if r.region_type in ['header', 'navigation']]
            if headers:
                description_parts.append(
                    f"Top section contains: {', '.join(r.text for r in headers[:3])}"
                )
        
        if middle_regions:
            main_content = [r for r in middle_regions if r.region_type == 'body']
            if main_content:
                description_parts.append(
                    f"Main content area with {len(main_content)} text blocks"
                )
            
            buttons = [r for r in middle_regions if r.region_type == 'button']
            if buttons:
                description_parts.append(
                    f"Interactive elements: {', '.join(r.text for r in buttons)}"
                )
        
        if bottom_regions:
            description_parts.append(
                f"Bottom section contains: {', '.join(r.text for r in bottom_regions[:2])}"
            )
        
        return '. '.join(description_parts) + '.'
    
    def create_llm_prompt(self, context: 'ScreenshotContext') -> str:
        """
        Create a structured prompt for LLM consumption
        """
        prompt = f"""SCREENSHOT CONTEXT:

Layout Overview:
{context.layout_description}

Extracted Text by Region:
"""
        
        # Group by region type
        by_type = {}
        for region in context.text_regions:
            if region.region_type not in by_type:
                by_type[region.region_type] = []
            by_type[region.region_type].append(region)
        
        # Add each region type
        for region_type, regions in sorted(by_type.items()):
            prompt += f"\n{region_type.upper()}:\n"
            for region in regions[:5]:  # Limit to avoid overwhelming
                prompt += f"  - {region.text}\n"
        
        prompt += f"\nFull Text Content:\n{context.full_text[:1000]}"  # Truncate if very long
        
        return prompt
    
    def process(self, image_path: str) -> ScreenshotContext:
        """
        Main pipeline method to process a screenshot
        
        Args:
            image_path: Path to screenshot image
            
        Returns:
            ScreenshotContext with all extracted information
        """
        # Load image
        image = Image.open(image_path)
        original_size = image.size
        
        # Preprocess
        processed_image = self.preprocess_image(image)
        
        # Extract text regions
        text_regions = self.extract_text_regions(processed_image)
        
        # Merge nearby regions
        merged_regions = self.merge_nearby_regions(text_regions)
        
        # Generate layout description
        layout_desc = self.generate_layout_description(merged_regions, original_size)
        
        # Combine all text
        full_text = '\n'.join(r.text for r in sorted(
            merged_regions, 
            key=lambda r: (r.bbox[1], r.bbox[0])
        ))
        
        # Create context object
        context = ScreenshotContext(
            text_regions=merged_regions,
            layout_description=layout_desc,
            full_text=full_text,
            llm_prompt='',  # Will be filled next
            metadata={
                'image_size': original_size,
                'num_regions': len(merged_regions),
                'region_types': list(set(r.region_type for r in merged_regions))
            }
        )
        
        # Generate LLM prompt
        context.llm_prompt = self.create_llm_prompt(context)
        
        return context
    
    def visualize_regions(self, 
                         image_path: str, 
                         context: ScreenshotContext,
                         output_path: Optional[str] = None) -> Image.Image:
        """
        Create a visualization of detected regions
        """
        image = Image.open(image_path)
        draw = ImageDraw.Draw(image)
        
        # Color map for different region types
        colors = {
            'header': 'red',
            'body': 'blue',
            'button': 'green',
            'navigation': 'orange',
            'label': 'purple',
            'text': 'cyan'
        }
        
        for region in context.text_regions:
            x, y, w, h = region.bbox
            color = colors.get(region.region_type, 'gray')
            
            # Draw rectangle
            draw.rectangle(
                [x, y, x + w, y + h],
                outline=color,
                width=2
            )
            
            # Add label
            draw.text(
                (x, y - 15),
                f"{region.region_type}: {region.confidence:.0f}%",
                fill=color
            )
        
        if output_path:
            image.save(output_path)
        
        return image


# def main():
#     """
#     Example usage of the pipeline
#     """
#     # Initialize pipeline
#     pipeline = ScreenshotSegmentationPipeline(
#         min_confidence=50.0,
#         merge_threshold=15,
#         enable_preprocessing=True
#     )
    
#     # Process screenshot
#     screenshot_path = "screenshot.png"  # Replace with your screenshot
    
#     print("Processing screenshot...")
#     context = pipeline.process(screenshot_path)
    
#     # Display results
#     print("\n" + "="*80)
#     print("LAYOUT DESCRIPTION:")
#     print("="*80)
#     print(context.layout_description)
    
#     print("\n" + "="*80)
#     print("DETECTED TEXT REGIONS:")
#     print("="*80)
#     for i, region in enumerate(context.text_regions[:10], 1):
#         print(f"\n{i}. [{region.region_type.upper()}] (confidence: {region.confidence:.1f}%)")
#         print(f"   Position: {region.bbox}")
#         print(f"   Text: {region.text[:100]}")
    
#     print("\n" + "="*80)
#     print("LLM PROMPT:")
#     print("="*80)
#     print(context.llm_prompt)
    
#     print("\n" + "="*80)
#     print("METADATA:")
#     print("="*80)
#     for key, value in context.metadata.items():
#         print(f"  {key}: {value}")
    
#     # Create visualization
#     viz_image = pipeline.visualize_regions(
#         screenshot_path,
#         context,
#         output_path="visualization.png"
#     )
#     print("\nVisualization saved to: visualization.png")


def main():
    """
    Example usage of the pipeline
    """
    # Initialize pipeline
    pipeline = ScreenshotSegmentationPipeline(
        min_confidence=50.0,
        merge_threshold=15,
        enable_preprocessing=True
    )
    
    # Process screenshot
    screenshot_path = "screenshot.png"  # Replace with your screenshot
    
    # Check if file exists
    if not Path(screenshot_path).exists():
        print(f"Error: Screenshot file '{screenshot_path}' not found!")
        print("Please provide a valid screenshot path.")
        return
    
    print("Processing screenshot...")
    context = pipeline.process(screenshot_path)
    
    # Display results
    print("\n" + "="*80)
    print("LAYOUT DESCRIPTION:")
    print("="*80)
    print(context.layout_description)
    
    print("\n" + "="*80)
    print("DETECTED TEXT REGIONS:")
    print("="*80)
    for i, region in enumerate(context.text_regions[:10], 1):
        print(f"\n{i}. [{region.region_type.upper()}] (confidence: {region.confidence:.1f}%)")
        print(f"   Position: {region.bbox}")
        print(f"   Text: {region.text[:100]}")
    
    print("\n" + "="*80)
    print("LLM PROMPT:")
    print("="*80)
    print(context.llm_prompt)
    
    print("\n" + "="*80)
    print("METADATA:")
    print("="*80)
    for key, value in context.metadata.items():
        print(f"  {key}: {value}")
    
    # Create visualization
    viz_image = pipeline.visualize_regions(
        screenshot_path,
        context,
        output_path="visualization.png"
    )
    print("\nVisualization saved to: visualization.png")


if __name__ == "__main__":
    main()
