import { useSelectable } from '../src/okaselect'

describe('okaselect', () => {
  describe('useSelectable', () => {
    const items = {
      a: { id: 'a' },
      b: { id: 'b' },
      c: { id: 'c' },
    }

    describe('select', () => {
      describe('when ctrl is false', () => {
        it('should replace selected ids with new id', () => {
          const target = useSelectable(() => items)
          expect(target.getSelectedItems()).toEqual([])
          expect(target.getLastSelectedId()).toBe(undefined)
          target.select('a')
          expect(target.getSelectedItems()).toEqual([{ id: 'a' }])
          expect(target.getLastSelectedId()).toBe('a')
          // replace
          target.select('b')
          expect(target.getSelectedItems()).toEqual([{ id: 'b' }])
          // idempotent
          target.select('b')
          expect(target.getSelectedItems()).toEqual([{ id: 'b' }])
        })
      })

      describe('when ctrl is true', () => {
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

    describe('multiSelect', () => {
      describe('when ctrl is false', () => {
        it('should replace selected ids with new ids', () => {
          const target = useSelectable(() => items)
          target.select('b')
          target.multiSelect(['a', 'c'])
          expect(target.getSelectedIds()).toEqual(['a', 'c'])
          // idempotent
          target.multiSelect(['a', 'c'])
          expect(target.getSelectedIds()).toEqual(['a', 'c'])
        })
      })

      describe('when ctrl is true', () => {
        it('should add the ids if some of the ids have not been selected yet', () => {
          const target = useSelectable(() => items)
          target.multiSelect(['a'], true)
          expect(target.getSelectedIds()).toEqual(['a'])
          target.multiSelect(['b'], true)
          expect(target.getSelectedIds()).toEqual(['a', 'b'])
          target.multiSelect(['a', 'c'], true)
          expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
        })
        it('should remove the ids if all of its have been selected already', () => {
          const target = useSelectable(() => items)
          target.multiSelect(['a', 'b', 'c'], true)
          target.multiSelect(['a', 'c'], true)
          expect(target.getSelectedIds()).toEqual(['b'])
        })
      })
    })

    describe('selectAll', () => {
      it('should select all items', () => {
        const target = useSelectable(() => items)
        target.selectAll()
        expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
      })
      it('should toggle select all items if toggle = true', () => {
        const target = useSelectable(() => items)
        target.select('a')
        target.selectAll(true)
        expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
        target.selectAll(true)
        expect(target.getSelectedIds()).toEqual([])
      })
    })

    describe('clear', () => {
      it('should clear the item', () => {
        const target = useSelectable(() => items)
        target.selectAll()
        expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
        target.clear('b')
        expect(target.getSelectedIds()).toEqual(['a', 'c'])
      })
    })

    describe('clearAll', () => {
      it('should clear all selections', () => {
        const target = useSelectable(() => items)
        target.selectAll()
        expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
        target.clearAll()
        expect(target.getSelectedIds()).toEqual([])
      })
    })
  })
})
