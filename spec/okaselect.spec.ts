import { useSelectable } from '../src/okaselect'

describe('okaselect', () => {
  describe('useSelectable', () => {
    const items = {
      a: { id: 'a' },
      b: { id: 'b' },
      c: { id: 'c' },
    }

    describe('when shift is false', () => {
      it('should replace the id', () => {
        const target = useSelectable(() => items)
        expect(target.getSelectedItems()).toEqual([])
        expect(target.getLastSelectedId()).toBe(undefined)
        target.select('a')
        expect(target.getSelectedItems()).toEqual([{ id: 'a' }])
        expect(target.getLastSelectedId()).toBe('a')
      })
    })

    describe('when shift is true', () => {
      it('should add the id if it has not been saved', () => {
        const target = useSelectable(() => items)
        target.select('a', true)
        expect(target.getSelectedItems()).toEqual([{ id: 'a' }])
        target.select('c', true)
        expect(target.getSelectedItems()).toEqual([{ id: 'a' }, { id: 'c' }])
        expect(target.getSelectedIds()).toEqual(['a', 'c'])
      })
      it('should remove the id if it has been saved', () => {
        const target = useSelectable(() => items)
        target.select('a', true)
        target.select('c', true)
        target.select('a', true)
        expect(target.getSelectedItems()).toEqual([{ id: 'c' }])
      })
    })
  })
})
