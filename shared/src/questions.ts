import type { Question } from './types.js'

export const QUESTIONS: Question[] = [
  { id: 'q1', theme: 'Speed — slowest to fastest', examples: ['snail = 1', 'rocket = 100'] },
  { id: 'q2', theme: 'Size — smallest to largest', examples: ['ant = 1', 'blue whale = 100'] },
  { id: 'q3', theme: 'Temperature — coldest to hottest', examples: ['ice = 1', 'sun = 100'] },
  { id: 'q4', theme: 'Age — youngest to oldest (things, not people)', examples: ['new iPhone = 1', 'Stonehenge = 100'] },
  { id: 'q5', theme: 'Loudness — quietest to loudest', examples: ['whisper = 1', 'jet engine = 100'] },
  { id: 'q6', theme: 'Sweetness — least sweet to sweetest', examples: ['lemon = 1', 'candy floss = 100'] },
  { id: 'q7', theme: 'Rarity — most common to rarest', examples: ['water = 1', 'element 118 = 100'] },
  { id: 'q8', theme: 'Distance from Earth — closest to farthest', examples: ['moon = 1', 'edge of observable universe = 100'] },
  { id: 'q9', theme: 'Danger — safest to most dangerous', examples: ['pillow = 1', 'nuclear bomb = 100'] },
  { id: 'q10', theme: 'Popularity — least known to most famous', examples: ['your neighbor = 1', 'the pope = 100'] },
  { id: 'q11', theme: 'Price — cheapest to most expensive', examples: ['paperclip = 1', 'space shuttle = 100'] },
  { id: 'q12', theme: 'Spiciness — mildest to spiciest', examples: ['milk = 1', 'ghost pepper = 100'] },
  { id: 'q13', theme: 'Height — shortest to tallest', examples: ['ant = 1', 'Mount Everest = 100'] },
  { id: 'q14', theme: 'Weight — lightest to heaviest', examples: ['feather = 1', 'cargo ship = 100'] },
  { id: 'q15', theme: 'Intelligence (animals) — simplest to most intelligent', examples: ['jellyfish = 1', 'chimpanzee = 100'] },
  { id: 'q16', theme: 'Flexibility — most rigid to most flexible', examples: ['concrete = 1', 'rubber band = 100'] },
  { id: 'q17', theme: 'Depth — shallowest to deepest', examples: ['puddle = 1', 'Mariana Trench = 100'] },
  { id: 'q18', theme: 'Brightness — darkest to brightest', examples: ['cave = 1', 'the sun = 100'] },
  { id: 'q19', theme: 'Softness — hardest to softest', examples: ['diamond = 1', 'cloud = 100'] },
  { id: 'q20', theme: 'Speed of change — most stable to fastest changing', examples: ['mountains = 1', 'social media trend = 100'] },
]

/**
 * Returns a shuffled copy of the questions array.
 */
export function shuffleQuestions(questions: Question[]): Question[] {
  const copy = [...questions]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
