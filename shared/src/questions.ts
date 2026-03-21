import type { Question } from './types'

export const QUESTIONS: Question[] = [
    { id: 'q1',  theme: 'How fast is it?',                    examples: ['sleeping sloth = 1', 'lightning bolt = 100'] },
    { id: 'q2',  theme: 'How big is it?',                     examples: ['grain of sand = 1', 'observable universe = 100'] },
    { id: 'q3',  theme: 'How hot is it?',                     examples: ['arctic tundra = 1', 'volcanic lava = 100'] },
    { id: 'q4',  theme: 'How old is it? (not people)',        examples: ['freshly baked bread = 1', 'Egyptian pyramids = 100'] },
    { id: 'q5',  theme: 'How loud is it?',                    examples: ['falling snowflake = 1', 'thunderclap = 100'] },
    { id: 'q6',  theme: 'How sweet is it?',                   examples: ['black coffee = 1', 'maple syrup = 100'] },
    { id: 'q7',  theme: 'How rare is it?',                    examples: ['tap water = 1', 'living dodo = 100'] },
    { id: 'q8',  theme: 'How far from Earth?',                examples: ['the stratosphere = 1', 'a distant quasar = 100'] },
    { id: 'q9',  theme: 'How dangerous is it?',               examples: ['bubble wrap = 1', 'supervolcano = 100'] },
    { id: 'q10', theme: 'How well-known is it?',              examples: ['your childhood pet = 1', 'the moon = 100'] },
    { id: 'q11', theme: 'How expensive is it?',               examples: ['a grain of salt = 1', 'a private island = 100'] },
    { id: 'q12', theme: 'How spicy is it?',                   examples: ['plain white rice = 1', 'pure capsaicin = 100'] },
    { id: 'q13', theme: 'How tall is it?',                    examples: ['a mushroom = 1', 'the atmosphere = 100'] },
    { id: 'q14', theme: 'How heavy is it?',                   examples: ['a soap bubble = 1', 'an iceberg = 100'] },
    { id: 'q15', theme: 'How clever is this animal?',         examples: ['sea sponge = 1', 'dolphin = 100'] },
    { id: 'q16', theme: 'How flexible is it?',                examples: ['a brick wall = 1', 'cooked spaghetti = 100'] },
    { id: 'q17', theme: 'How deep is it?',                    examples: ['a muddy puddle = 1', 'deep ocean trench = 100'] },
    { id: 'q18', theme: 'How bright is it?',                  examples: ['a moonless night = 1', 'a welding arc = 100'] },
    { id: 'q19', theme: 'How soft is it?',                    examples: ['solid granite = 1', 'fresh marshmallow = 100'] },
    { id: 'q20', theme: 'How fast does it change?',           examples: ['the ocean floor = 1', 'a viral meme = 100'] },
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
