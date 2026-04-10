const BASE = import.meta.env.BASE_URL

export const IMAGES = {
  heroAbout: `${BASE}images/hero-about.jpg`,
  journey1: `${BASE}images/journey1.jpg`,
  journey2: `${BASE}images/journey2.jpg`,
  services1: `${BASE}images/services1.jpg`,
  services2: `${BASE}images/services2.jpg`,
  consultation: `${BASE}images/consultation.jpg`,
  adeProfile: `${BASE}images/ade-profile.jpg`,
  adeJoin: `${BASE}images/ade-join.jpg`,
  articleHypno: `${BASE}images/article-hypno.jpg`,
  articleABC: `${BASE}images/article-abc.jpg`,
  articleBeliefs: `${BASE}images/article-beliefs.jpg`,
}

export const ADE_BIO = {
  name: 'Ademar Cutang',
  title: 'Your Therapist and Coach',
  subtitle: 'Founder, Bestyouversion Inc.',
  intro: 'With a foundation built on the pursuit of knowledge and a passion for empowering individuals, I am Ademar Cutang, an esteemed professional with a wealth of experience spanning decades in the realm of personal development and transformation.',
  credentials: [
    'Licensed Clinical Psychologist',
    'Certified Master NLP Practitioner accredited by IGGP UK',
    'Certified Hypnotherapist',
    'Certified Cognitive Behavioral Therapist',
    'Certified Human Resource Professional by The International Federation of Professional Managers (IFPM) Philippines',
  ],
  experience: 'Over the course of my 15-year career, I have dedicated myself to guiding individuals and organizations towards unlocking their full potential. Through therapy sessions, coaching, and engaging talks, my mission revolves around helping you become the best version of yourself.',
  approach: 'Whether you are seeking personal transformation, organizational development, or a captivating speaker for your event, I bring a unique blend of academic excellence and practical expertise to the table. My approach is rooted in the belief that each person has the power to shape their destiny and evolve into a more fulfilled and empowered individual.',
  cta: "Join me on this transformative journey, and let's embark together on a path to self-discovery, growth, and ultimate success. Let's rewrite your story and create a narrative that reflects the best version of yourself.",
}

export const THERAPY_PAGES = {
  nlp: {
    title: 'Neuro-Linguistic Programming (NLP)',
    subtitle: 'Unlocking Potential',
    intro: 'Neuro-Linguistic Programming (NLP) is a psychological methodology that delves into the strategies employed by successful individuals, aiming to apply these strategies for personal goal attainment. It intricately weaves together thoughts, language, and learned behavior patterns, drawing from one\'s experiences to achieve specific outcomes.',
    sections: [
      { heading: 'Evolution of NLP', content: 'In the 1970s, NLP emerged at the University of California, Santa Cruz, primarily developed by John Grinder, a linguist, and Richard Bandler, an information scientist and mathematician. Their groundbreaking book, "Structure of Magic: A Book about Language of Therapy," unveiled communication patterns that distinguished exceptional communicators.' },
      { heading: 'Diverse applications', content: 'Interest in NLP surged in the late 1970s as Bandler and Grinder marketed it as a tool for learning success strategies. Today, NLP finds application in diverse fields, including counseling, medicine, law, business, performing arts, sports, the military, and education.' },
      { heading: 'How NLP works', content: 'Central to NLP are modeling, action, and effective communication. The premise is that understanding how an individual accomplishes a task enables others to replicate and communicate the process. NLP practitioners believe in personal maps of reality, encouraging a systematic overview of situations by analyzing multiple perspectives.' },
      { heading: 'Logical levels of change', content: 'NLP posits natural hierarchies of learning, communication, and change. The six logical levels include: Purpose and Spirituality, Identity, Beliefs and Values, Capabilities and Skills, Behaviors, and Environment. Changes at a lower level can influence higher levels, and vice versa, fostering holistic development.' },
      { heading: 'NLP in therapeutic practice', content: 'A fundamental NLP concept is "The map is not the territory," emphasizing the distinction between belief and reality. NLP therapists focus on understanding an individual\'s unique perception of the world. Advocates claim NLP produces rapid, lasting results, enhancing cognitive and behavioral understanding. Over the years, NLP has been applied successfully in addressing anxiety, phobias, communication challenges, PTSD, depression, ADHD, addiction, and obsessive-compulsive disorders.' },
    ],
  },
  cbt: {
    title: 'Cognitive Behavioral Therapy (CBT)',
    subtitle: 'What is CBT?',
    intro: 'Cognitive Behavioral Therapy (CBT) is a focused and goal-oriented form of talk therapy widely used by mental health professionals, including psychologists, therapists, and counselors. It is a well-researched and widely adopted approach to treating various mental health conditions and emotional challenges.',
    sections: [
      { heading: 'Core principles', content: 'CBT is rooted in key principles: psychological issues often arise from problematic or unhelpful patterns of thinking; learned patterns of unhelpful behavior contribute to mental health challenges; and problematic core beliefs about oneself and the world impact psychological well-being.' },
      { heading: 'What CBT can treat', content: 'CBT is effective in managing a broad spectrum of conditions including depression, OCD, PTSD, ADHD, phobias, personality disorders, eating disorders, substance use disorder, bipolar disorder, schizophrenia (combined with medication), and anxiety. Studies also indicate effectiveness for insomnia, chronic pain, chronic fatigue syndrome, migraines, and IBS.' },
      { heading: 'How CBT works', content: 'The process involves understanding the issue by discussing challenges and setting goals; question-and-answer sessions to explore incidents, fears, and thoughts; recognizing problematic thoughts and behaviors; and collaborating with the therapist to change negative patterns, fostering a positive perspective. CBT typically spans five to twenty sessions.' },
    ],
  },
  hypnotherapy: {
    title: 'Hypnotherapy',
    subtitle: 'Your path to healing',
    intro: 'Unlock the potential of hypnotherapy, a powerful technique leveraging hypnosis for treating various symptoms and health conditions. Unlike the cliché image of a pocket watch-wielding magician, our professional hypnotherapy sessions focus on guided visualizations and relaxation, helping you overcome challenges and acquire valuable coping skills.',
    sections: [
      { heading: 'Why hypnotherapy?', content: 'Used in treating phobias, anxiety, pain management, weight loss, and more, hypnotherapy\'s roots date back to the late 1700s. Modern research has brought credibility to its therapeutic uses, showcasing its effectiveness in inducing a trance-like state, allowing profound focus on inner experiences.' },
      { heading: 'Techniques we employ', content: 'Our techniques include relaxation (visualizing a peaceful state even when facing fears), suggestion (gentle behavioral suggestions to conquer issues), coping skills (cognitive-behavioral techniques for fears), and exploration of past experiences (understanding and addressing origins of challenges).' },
      { heading: 'What hypnotherapy can address', content: 'Consider hypnotherapy for chronic pain, dementia symptoms, nausea related to chemotherapy, anxiety, depression, eating disorders, and PTSD. It offers a holistic approach when delivered by licensed professionals.' },
      { heading: 'Benefits of hypnosis as therapy', content: 'Experience awareness, deep focus, and relaxation during sessions. Break free from distractions and daily concerns, fostering a calm and receptive state. Calming messages ensure a safe environment for addressing problems without panic.' },
      { heading: 'Common misconceptions', content: 'It\'s not stage hypnosis — our focus is therapeutic. You\'ll remember your hypnotic state. You remain in control and cannot be coerced. Hypnotizability doesn\'t correlate with intelligence.' },
    ],
  },
}

export const ARTICLES = [
  {
    id: 'hypnotherapy-comedy',
    title: "Unveiling the Mind's Comedy Club: Healing with Hypnotherapy",
    excerpt: 'Plato once said, "If you want to heal the body, you must first heal the mind." Let\'s explore the wild world of healing through laughter and hypnotherapy.',
    image: IMAGES.articleHypno,
    content: `Plato once dropped the mic, saying, "If you want to heal the body, you must first heal the mind." So, let's hop on this thought train and explore the wild world of healing through laughter and hypnotherapy.

Ever pondered why life feels like a sitcom with plot holes? Relationships, finances, health — it's like our personal drama series. Are we accidentally playing the role of our own villain, or are we the unsung heroes? Let's take a fun selfie with our mind's selfie camera and dive into the rabbit hole of self-discovery.

Our mind, the undisputed headliner, has a three-ring circus going on — the conscious, the subconscious, and the unconscious. The conscious is the Sherlock Holmes of the mind, analyzing and questioning. The subconscious is the emotional DJ, spinning tunes of beliefs and experiences. Meanwhile, the unconscious is the backstage crew, blinking our eyes without us even thinking about it.

Enter hypnotherapy, the mind's stand-up comedy show! Misunderstood as a sleep-inducing trance, it's actually a heightened state of awareness. It's like Netflix for your subconscious, accessing the root of your issues while you snack on mental popcorn.

Hypnotherapy isn't just a parlor trick; it's a rockstar therapy with a history. Approved by medical bigwigs, including the British and American Medical Associations.

In the grand finale, hypnotherapy takes a bow. Resurging in popularity, it's not just a trend; it's a mind-altering experience. Dive into the mind's comedy club, let laughter echo through the subconscious, and watch the mind's encore performance unfold — a healing symphony of mind and body.`,
  },
  {
    id: 'abc-model',
    title: "Unveiling the Magic of Albert Ellis' ABC Model in CBT",
    excerpt: "Modern CBT traces its lineage back to Aaron Beck's Cognitive Therapy. Let's explore Albert Ellis's ABC Model — a treasure trove of wisdom in therapy.",
    image: IMAGES.articleABC,
    content: `Modern CBT traces its lineage back to Aaron Beck's Cognitive Therapy. Albert Ellis's Rational-Emotive Behavior Therapy (REBT) emerged as one of the roots of this transformative journey.

The ABC Model is a magical formula where external events (A) don't play puppeteer with your emotions (C). Instead, it's the beliefs (B) that hold the strings.

A: Activating Event — Life throws a curveball.
B: Belief — Your mind chimes in with a thought, rational or irrational.
C: Consequence — Emotions and actions follow, either uplifting or challenging.
D: Disputation — Challenge that irrational belief, flip it to rational.
E: New Effect — The magical transformation; healthier consequences bloom.

The ABC Model isn't just for the therapists' office; it's your toolkit for navigating daily life.

As we wrap up, remember: you may not control the activating events, but you wield the mighty sword of beliefs, shaping your own destiny.`,
  },
  {
    id: 'limiting-beliefs',
    title: 'Unleashing Your True Potential: Overcoming Limiting Beliefs',
    excerpt: 'Each of us carries a unique set of beliefs, shaping our behaviors in ways we may not even realize. Hidden within us are limiting beliefs — subtle whispers that impact our decisions.',
    image: IMAGES.articleBeliefs,
    content: `Ever find yourself hesitating to reach for the stars? How much of our limitations are truly the result of our own belief systems?

Limiting beliefs restrict the realm of possibilities for you. These are thoughts or mindsets that you accept as truths, unwittingly putting a leash on your potential.

Here are 5 ways to craft a belief system that elevates you:

Discover the Positive Intention: Unravel the deeper motivations behind your beliefs and update your mental map.

Question Everything: Get curious about your behavior. Do your actions truly serve you?

Search for Evidence: Believing something doesn't make it true. Dive deep into your limiting beliefs.

Upgrade Your Thinking: Don't let past experiences dictate your present.

Ownership Check: Are these beliefs truly yours, or have they been handed down by others?

Get ready to unleash your true potential and rewrite the narrative of your extraordinary life!`,
  },
]