# SpatialBench

**Open source benchmarks for multimodal AI reasoning.**

SpatialBench is designed to evaluate the next generation of multimodal AI models on their ability to reason about space, structure, and pathing. We test models not just on what they know, but on how well they can "see" and manipulate abstract concepts in 2D and 3D space.

## 🎯 Features

- **2D Path Tracing**: Test visual path-following capabilities with complex Bezier curve networks
- **3D Mental Rotation**: Shepard-Metzler style mental rotation tasks for spatial reasoning
- **Interactive Practice**: Try the challenges yourself and compare against AI models
- **Live Leaderboard**: Track the performance of state-of-the-art multimodal models

## 🚀 Live Demo

Visit the live benchmark at: **https://spicylemonade.github.io/spatialbench/**

## 📊 Current Results

Using the **Probability Equivalence Method**:

- **Human Baseline**: 80.0%
- **Gemini 3.0 Pro Preview**: 9.55%
- **GPT-5.1 (High Reasoning)**: 7.51%
- **Random Guessing**: 5.0%

Current AI models struggle significantly with spatial reasoning tasks that humans excel at, scoring just above the 5% random baseline.

## 🛠️ Technology Stack

- **Frontend**: React + Vite
- **3D Rendering**: Three.js
- **2D Graphics**: SVG
- **Styling**: Tailwind CSS
- **Deployment**: GitHub Pages

## 🏃 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📝 Methodology

Models are evaluated on 50 total problems:
- 25 3D mental rotation tasks (Shepard-Metzler style with 4 multiple-choice options)
- 25 2D path tracing tasks (with 20 possible numeric endpoints)

### Probability Equivalence Scoring

Since 3D questions have a 25% random guess rate (1/4) while 2D questions have only 5% (1/20), we normalize the difficulty:

1. **Calculate raw scores** for each section independently
2. **Adjust 3D score**: Raise to the power of 2.16 to match 2D difficulty
   - Exponent derived from: 0.25^n = 0.05, solving n ≈ 2.16
3. **Final score**: Average of raw 2D score and adjusted 3D score

**Formula:** `Final = (S_2D + S_3D^2.16) / 2`

This ensures random guessing yields exactly 5% and prevents "stat-padding" on easier questions.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Submit issues for bugs or feature requests
- Add new spatial reasoning tasks
- Improve the UI/UX
- Test additional AI models

## 📄 License

MIT License

## 📬 Contact

Follow [@spicey_lemonade](https://twitter.com/spicey_lemonade) on Twitter/X

---

*Why spatial reasoning matters:* Just as humans use visual tracing and mental rotation for complex tasks like circuit analysis, CAD engineering, and molecular biology, future AI systems must possess these intrinsic capabilities to fully automate physical world reasoning.

