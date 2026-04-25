import matplotlib.pyplot as plt
import numpy as np
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
import cairosvg
import io
import os
from PIL import Image

# Base path
BASE_DIR = "/home/spicylemon/Documents/spatialbench"

# Data
data = [
    {'model': 'GPT-5.5\n(XHigh Reasoning)', 'full_name': 'GPT-5.5\n(XHigh Reasoning)', 'company': 'OpenAI', 'score': 14.25, 'color': '#000000', 'logo': 'src/logos/openai.svg'},
    {'model': 'Qwen', 'full_name': 'Qwen3-VL-235B\n-A22B-Instruct', 'company': 'Qwen', 'score': 13.5, 'color': '#D95E00', 'logo': 'src/logos/qwen-color.svg'},
    {'model': 'Qwen', 'full_name': 'Qwen-2.5-VL\n-72B-Instruct', 'company': 'Qwen', 'score': 12.9, 'color': '#D95E00', 'logo': 'src/logos/qwen-color.svg'},
    {'model': 'Gemini 3.1 Pro\nPreview', 'full_name': 'Gemini 3.1 Pro\nPreview', 'company': 'Google', 'score': 10.05, 'color': '#34A853', 'logo': 'src/logos/gemini-color.svg'},
    {'model': 'Gemini 3.0 Pro\nPreview', 'full_name': 'Gemini 3.0 Pro\nPreview', 'company': 'Google', 'score': 9.6, 'color': '#34A853', 'logo': 'src/logos/gemini-color.svg'},
    {'model': 'GPT-5.4\n(XHigh Reasoning)', 'full_name': 'GPT-5.4\n(XHigh Reasoning)', 'company': 'OpenAI', 'score': 8.54, 'color': '#000000', 'logo': 'src/logos/openai.svg'},
    {'model': 'Llama 3.2', 'full_name': 'Llama 3.2', 'company': 'Meta', 'score': 8.3, 'color': '#0081FB', 'logo': 'src/logos/meta-color.svg'},
    {'model': 'GPT-5.1\n(High Reasoning)', 'full_name': 'GPT-5.1\n(High Reasoning)', 'company': 'OpenAI', 'score': 7.5, 'color': '#000000', 'logo': 'src/logos/openai.svg'},
    {'model': 'Pixtral 12B', 'full_name': 'Pixtral 12B', 'company': 'Mistral', 'score': 5.0, 'color': '#F53288', 'logo': 'src/logos/mistral-color.svg'},
    {'model': 'Random Guessing\n(Baseline)', 'full_name': 'Random Guessing\n(Baseline)', 'company': 'Baseline', 'score': 5.0, 'color': '#CCCCCC', 'logo': None},
    {'model': 'Claude Sonnet\n4.5', 'full_name': 'Claude Sonnet\n4.5', 'company': 'Anthropic', 'score': 4.5, 'color': '#5E9CA0', 'logo': 'src/logos/claude-color.svg'},
    {'model': 'MiniMax 01\nVision', 'full_name': 'MiniMax 01\nVision', 'company': 'MiniMax', 'score': 4.0, 'color': '#9F85FF', 'logo': 'src/logos/minimax-color.svg'},
    {'model': 'Grok 4', 'full_name': 'Grok 4', 'company': 'xAI', 'score': 3.0, 'color': '#D0021B', 'logo': 'src/logos/grok.svg'},
]

scores = [d['score'] for d in data]
colors = [d['color'] for d in data]

# Setup Figure
fig, ax = plt.subplots(figsize=(16, 8))
fig.patch.set_facecolor('white')

# Vertical Bars
x_pos = np.arange(len(data))
bars = ax.bar(x_pos, scores, color=colors, width=0.75)

# Customize Spines & Grid
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['left'].set_visible(False)
ax.spines['bottom'].set_color('#E5E7EB') 

ax.yaxis.grid(True, linestyle='-', alpha=0.4, color='#E5E7EB')
ax.set_axisbelow(True)

# Remove Y axis ticks/labels
ax.tick_params(axis='y', left=False, labelleft=False)
# Remove X axis ticks AND labels (numbers 0, 1, 2...)
ax.tick_params(axis='x', bottom=False, labelbottom=False)

# Add Score Labels on Top
for i, v in enumerate(scores):
    ax.text(i, v + 0.3, str(v), ha='center', fontweight='bold', fontsize=12, color='black')

# Add Text Description at Top
plt.figtext(0.08, 0.94, "SpatialBench - AI Spatial Reasoning Benchmark", fontsize=20, fontweight='bold', fontname='sans-serif')
description = (
    "SpatialBench is designed to evaluate the next generation of multimodal AI models on their ability to reason about space, structure, and pathing. Just as\n"
    "humans use visual tracing and mental rotation for complex tasks like circuit analysis, CAD engineering, and molecular biology, future AI systems must\n"
    "possess these intrinsic capabilities to fully automate physical world reasoning. We test models not just on what they know, but on how well they can\n"
    "'see' and manipulate abstract concepts in 2D and 3D space."
)
plt.figtext(0.08, 0.82, description, fontsize=11, ha='left', wrap=True, linespacing=1.5)

# Y-Label
ax.set_ylabel('SpatialBench Score', fontsize=12, labelpad=10)

# Function to load SVG
def get_image_from_svg(svg_rel_path):
    if svg_rel_path is None:
        return None
    
    full_path = os.path.join(BASE_DIR, svg_rel_path)
    if not os.path.exists(full_path):
        print(f"Warning: File not found: {full_path}")
        return None
        
    try:
        # Scale up slightly for better quality
        png_data = cairosvg.svg2png(url=full_path, scale=2.0)
        image = Image.open(io.BytesIO(png_data))
        return np.array(image)
    except Exception as e:
        print(f"Error loading logo {full_path}: {e}")
        return None

# Add Labels and Logos below bars
for i, d in enumerate(data):
    # Text Label (Model Name) - Moved down to make room for logo
    ax.text(i, -2.0, d['full_name'], ha='center', va='top', fontsize=10, linespacing=1.2)
    
    # Logo
    logo_path = d['logo']
    if logo_path:
        logo_img = get_image_from_svg(logo_path)
        if logo_img is not None:
            # Adjust zoom based on actual image size
            imagebox = OffsetImage(logo_img, zoom=0.08) 
            
            # Position logo at y=-0.9 (just below the x-axis line)
            ab = AnnotationBbox(imagebox, (i, -0.9), frameon=False, box_alignment=(0.5, 0.5))
            ax.add_artist(ab)
        else:
            print(f"Failed to load image for {d['model']}")

# Adjust margins
plt.subplots_adjust(bottom=0.2, top=0.75, left=0.08, right=0.95)

# Save
output_path = os.path.join(BASE_DIR, 'spatialbench_leaderboard_v2.png')
plt.savefig(output_path, dpi=300)
print(f"Graph saved to {output_path}")
