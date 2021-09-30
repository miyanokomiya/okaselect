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
          const onUpdated = jest.fn()
          const target = useSelectable(() => items, { onUpdated })
          expect(target.getSelectedItems()).toEqual([])
          expect(target.getLastSelectedId()).toBe(undefined)
          target.select('a')
          expect(target.getSelectedItems()).toEqual([{ id: 'a' }])
          expect(target.getLastSelectedId()).toBe('a')
          expect(onUpdated).toHaveBeenCalledTimes(1)
          // replace
          target.select('b')
          expect(target.getSelectedItems()).toEqual([{ id: 'b' }])
          expect(onUpdated).toHaveBeenCalledTimes(2)
          // idempotent
          target.select('b')
          expect(target.getSelectedItems()).toEqual([{ id: 'b' }])
          expect(onUpdated).toHaveBeenCalledTimes(3)
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
          const onUpdated = jest.fn()
          const target = useSelectable(() => items, { onUpdated })
          target.select('b')
          expect(onUpdated).toHaveBeenCalledTimes(1)
          target.multiSelect(['a', 'c'])
          expect(target.getSelectedIds()).toEqual(['a', 'c'])
          expect(onUpdated).toHaveBeenCalledTimes(2)
          // idempotent
          target.multiSelect(['a', 'c'])
          expect(target.getSelectedIds()).toEqual(['a', 'c'])
          expect(onUpdated).toHaveBeenCalledTimes(3)
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
        const onUpdated = jest.fn()
        const target = useSelectable(() => items, { onUpdated })
        target.selectAll()
        expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
        expect(onUpdated).toHaveBeenCalledTimes(1)
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
        const onUpdated = jest.fn()
        const target = useSelectable(() => items, { onUpdated })
        target.selectAll()
        expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
        target.clear('b')
        expect(target.getSelectedIds()).toEqual(['a', 'c'])
        expect(onUpdated).toHaveBeenCalledTimes(2)
      })
    })

    describe('clearAll', () => {
      it('should clear all selections', () => {
        const onUpdated = jest.fn()
        const target = useSelectable(() => items, { onUpdated })
        target.selectAll()
        expect(target.getSelectedIds()).toEqual(['a', 'b', 'c'])
        target.clearAll()
        expect(target.getSelectedIds()).toEqual([])
        expect(onUpdated).toHaveBeenCalledTimes(2)
      })
    })

    describe('getSelectedById', () => {
      it('should return selected ids as an object', () => {
        const target = useSelectable(() => items)
        target.select('a')
        expect(target.getSelectedById()).toEqual({
          a: true,
        })
      })
    })

    describe('getSelectedItemsById', () => {
      it('should return selected items as an object', () => {
        const target = useSelectable(() => items)
        target.select('a')
        expect(target.getSelectedItemsById()).toEqual({
          a: { id: 'a' },
        })
      })
    })
  })
})
