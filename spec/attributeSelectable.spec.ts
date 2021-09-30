import { useAttributeSelectable } from '../src/attributeSelectable'

describe('src/attributeSelectable.ts', () => {
  describe('useAttributeSelectable', () => {
    const items = {
      a: { id: 'a' },
      b: { id: 'b' },
      c: { id: 'c' },
    }

    describe('select', () => {
      describe('when ctrl is false', () => {
        it('should replace selected attrs with new status', () => {
          const onUpdated = jest.fn()
          const target = useAttributeSelectable(() => items, { onUpdated })
          expect(target.getSelectedById()).toEqual({})
          target.select('a', 'a_0')
          expect(target.getSelectedById()).toEqual({ a: { a_0: true } })
          expect(onUpdated).toHaveBeenCalledTimes(1)
          // replace
          target.select('a', 'a_1')
          expect(target.getSelectedById()).toEqual({ a: { a_1: true } })
          target.select('b', 'b_1')
          expect(target.getSelectedById()).toEqual({ b: { b_1: true } })
          // idempotent
          target.select('b', 'b_1')
          expect(target.getSelectedById()).toEqual({ b: { b_1: true } })
        })
      })

      describe('when ctrl is true', () => {
        it('should add the status if it has not been saved', () => {
          const target = useAttributeSelectable(() => items)
          target.select('a', 'a_0', true)
          expect(target.getSelectedById()).toEqual({ a: { a_0: true } })
          target.select('c', 'c_0', true)
          expect(target.getSelectedById()).toEqual({
            a: { a_0: true },
            c: { c_0: true },
          })
        })
        it('should remove the status if it has been saved', () => {
          const target = useAttributeSelectable(() => items)
          target.select('a', 'a_0', true)
          target.select('a', 'a_1', true)
          target.select('c', 'c_0', true)
          target.select('a', 'a_0', true)
          target.select('c', 'c_0', true)
          expect(target.getSelectedById()).toEqual({
            a: { a_1: true },
          })
        })
      })
    })
  })
})
