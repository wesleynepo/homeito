import { describe, it, expect } from 'vitest'
import { QUESTIONS } from '@ito/shared'
import en from '../i18n/en.json'
import ptBR from '../i18n/pt-BR.json'

type LocaleQuestions = Record<string, { theme: string; examples: string }>

describe('locale completeness', () => {
  it('pt-BR has all top-level sections that en has', () => {
    const enKeys = Object.keys(en)
    for (const key of enKeys) {
      expect(ptBR, `pt-BR is missing section "${key}"`).toHaveProperty(key)
    }
  })

  it('en and pt-BR have the same number of top-level sections', () => {
    expect(Object.keys(ptBR).length).toBe(Object.keys(en).length)
  })
})

describe('question translations — en', () => {
  const questions = (en as { questions: LocaleQuestions }).questions

  it('has an entry for every question id in QUESTIONS', () => {
    for (const q of QUESTIONS) {
      expect(questions, `en is missing question "${q.id}"`).toHaveProperty(q.id)
    }
  })

  it('every entry has a non-empty theme and examples', () => {
    for (const q of QUESTIONS) {
      expect(questions[q.id].theme.length).toBeGreaterThan(0)
      expect(questions[q.id].examples.length).toBeGreaterThan(0)
    }
  })

  it('has exactly as many entries as QUESTIONS', () => {
    expect(Object.keys(questions).length).toBe(QUESTIONS.length)
  })
})

describe('question translations — pt-BR', () => {
  const questions = (ptBR as { questions: LocaleQuestions }).questions

  it('has an entry for every question id in QUESTIONS', () => {
    for (const q of QUESTIONS) {
      expect(questions, `pt-BR is missing question "${q.id}"`).toHaveProperty(q.id)
    }
  })

  it('every entry has a non-empty theme and examples', () => {
    for (const q of QUESTIONS) {
      expect(questions[q.id].theme.length).toBeGreaterThan(0)
      expect(questions[q.id].examples.length).toBeGreaterThan(0)
    }
  })

  it('themes are actually translated (differ from en)', () => {
    const enQuestions = (en as { questions: LocaleQuestions }).questions
    for (const q of QUESTIONS) {
      expect(
        questions[q.id].theme,
        `pt-BR theme for "${q.id}" is identical to en — it may not be translated`
      ).not.toBe(enQuestions[q.id].theme)
    }
  })

  it('examples are actually translated (differ from en)', () => {
    const enQuestions = (en as { questions: LocaleQuestions }).questions
    for (const q of QUESTIONS) {
      expect(
        questions[q.id].examples,
        `pt-BR examples for "${q.id}" are identical to en — they may not be translated`
      ).not.toBe(enQuestions[q.id].examples)
    }
  })
})
