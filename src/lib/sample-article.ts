export const sampleArticle = {
  title: 'The Science of Reading: How Our Brains Decode Text',
  siteName: 'ClearText AI Sample',
  textContent: `Reading is one of the most complex cognitive tasks the human brain performs. Unlike spoken language, which humans have evolved to process over hundreds of thousands of years, reading is a relatively recent invention — only about 5,000 years old. This means our brains have had to repurpose existing neural circuits to handle this demanding task.

When you look at a word on a page, the visual information first enters through your eyes and travels to the primary visual cortex at the back of your brain. From there, it moves to a specialized region called the Visual Word Form Area (VWFA), sometimes called the brain's "letterbox." This region, located in the left fusiform gyrus, becomes highly tuned to recognize letter patterns and word shapes through years of reading practice.

The VWFA doesn't just recognize individual letters — it processes common letter combinations and entire word forms. Skilled readers can recognize familiar words almost instantly, in a process called "orthographic recognition." This is why experienced readers don't need to sound out every word; they can recognize the visual pattern of a word as a whole unit.

After the visual processing stage, the brain must connect the written word to its meaning. This involves two main pathways. The first is the phonological route, which converts letters into sounds (phonemes) and then matches those sounds to known words. This is the pathway beginning readers rely on heavily. The second is the lexical route, which directly maps the visual word form to its meaning in our mental dictionary, bypassing the need to sound out the word.

Dyslexia, which affects approximately 15-20% of the population, is primarily associated with difficulties in the phonological route. People with dyslexia often have trouble breaking words down into their component sounds, which makes decoding new or unfamiliar words particularly challenging. However, many people with dyslexia develop strong compensatory strategies and can become highly proficient readers with the right support and tools.

Modern accessibility tools leverage our understanding of reading neuroscience to help all readers. Features like adjustable font sizes, increased letter and line spacing, and dyslexia-friendly fonts work by reducing the visual processing load on the brain. Bionic reading, which bolds the first portion of each word, takes advantage of the brain's ability to predict word completions from partial visual information.

Research has shown that simple modifications to text presentation can significantly improve reading speed and comprehension for many readers. For example, increasing line spacing by just 1.5 times the default can improve reading speed by up to 20% for readers with dyslexia. Similarly, using a slightly larger font size and a clean, sans-serif typeface can reduce eye strain and improve sustained reading performance for all readers.

The future of accessible reading technology is promising. AI-powered text simplification can make complex content accessible to a broader audience without losing essential information. Combined with customizable visual presentation and audio support, these tools are helping to democratize access to information for people of all reading abilities.`,
};

export const sampleArticlesList = [
  {
    id: 'science-reading',
    title: 'The Science of Reading: How Our Brains Decode Text',
    badge: '⚡ Science of Reading (3 min)',
    siteName: 'Neuroscience Daily',
    textContent: sampleArticle.textContent,
  },
  {
    id: 'neurodiversity',
    title: 'Neurodiversity & Cognitive Strengths in Modern Workspaces',
    badge: '🧠 Neurodiversity & Cognition (2 min)',
    siteName: 'Cognitive Frontiers',
    textContent: `Neurodiversity describes the natural variations in how human brains process information, learn, and experience the world. Rather than viewing conditions like dyslexia, ADHD, autism, and dyspraxia as deficits to be corrected, the neurodiversity paradigm recognizes them as valuable cognitive variations with distinct strengths.

For example, individuals with dyslexia frequently demonstrate exceptional spatial reasoning, creative problem-solving skills, and holistic interconnected thinking. Many pioneering architects, inventors, and entrepreneurs attribute their innovative perspectives directly to dyslexic thinking styles.

Similarly, individuals with ADHD often exhibit remarkable hyperfocus on novel tasks, high energy, and divergent thinking that drives entrepreneurial breakthrough. When modern digital environments adapt to support varied sensory and cognitive profiles — through customizable typography, reduced clutter, and multimodal sensory interfaces — neurodivergent individuals flourish.

Designing digital tools with neurodiversity at the center creates a universal benefit: when a layout is clearer for someone with ADHD or dyslexia, it becomes effortlessly readable and delightful for everyone.`,
  },
  {
    id: 'bionic-vision',
    title: 'Saccadic Eye Movement and Artificial Fixation in Reading',
    badge: '🔬 Bionic Fixation & Flow (2 min)',
    siteName: 'Visual Ergonomics Journal',
    textContent: `When we read continuous prose, our eyes do not glide smoothly across lines of text. Instead, they execute rapid ballistic jumps called saccades, interspersed with brief stationary moments known as fixations. During each fixation, which typically lasts between 200 and 250 milliseconds, our foveal vision captures a window of approximately 7 to 9 characters.

Traditional reading requires the visual system to constantly calibrate the optimal landing position for each subsequent saccade. For readers experiencing visual stress, convergence fatigue, or phonological processing delays, erratic saccades frequently result in regressive eye movements — jumping backward to reread previously decoded words.

Artificial fixation systems, commonly known as Bionic Reading, strategically accentuate the initial 40 to 50 percent of each word with optical weight. This typographic anchor provides a high-contrast landing marker for the visual cortex, allowing the peripheral perceptual field to project word completion without requiring full-word saccadic stops. The net outcome is a measured reduction in cognitive friction and heightened reading momentum.`,
  },
];
