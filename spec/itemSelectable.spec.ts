import { itemSelectable } from '../src/itemSelectable'

describe('okaselect', () => {
  describe('itemSelectable', () => {
    const items = {
      a: { id: 'a' },
      b: { id: 'b' },
      c: { id: 'c' },
    }

    describe('select', () => {
      describe('when ctrl is false', () => {
        it('should replace selected ids with new id', () => {
          const onUpdated = jest.fn()
          const target = itemSelectable(() => items, { onUpdated })
          expect(target.getSelectedItemList()).toEqual([])
          expect(target.getLastSelected()).toBe(undefined)
          target.select('a')
          expect(target.getSelectedItemList()).toEqual([{ id: 'a' }])
          expect(target.getLastSelected()).toBe('a')
          expect(onUpdated).toHaveBeenCalledTimes(1)
          // replace
          target.select('b')
          expect(target.getSelectedItemList()).toEqual([{ id: 'b' }])
          expect(onUpdated).toHaveBeenCalledTimes(2)
          // idempotent
          target.select('b')
          expect(target.getSelectedItemList()).toEqual([{ id: 'b' }])
          expect(onUpdated).toHaveBeenCalledTimes(3)
        })
      })

      describe('when ctrl is true', () => {
        it('should add the id if it has not been saved', () => {
          const target = itemSelectable(() => items)
          target.select('a', true)
          expect(target.getSelectedItemList()).toEqual([{ id: 'a' }])
          target.select('c', true)
          expect(target.getSelectedItemList()).toEqual([
            { id: 'a' },
            { id: 'c' },
          ])
          expect(target.getSelectedList()).toEqual(['a', 'c'])
        })
        it('should remove the id if it has been saved', () => {
          const target = itemSelectable(() => items)
          target.select('a', true)
          target.select('c', true)
          target.select('a', true)
          expect(target.getSelectedItemList()).toEqual([{ id: 'c' }])
        })
      })
    })

    describe('multiSelect', () => {
      describe('when ctrl is false', () => {
        it('should replace selected ids with new ids', () => {
          const onUpdated = jest.fn()
          const target = itemSelectable(() => items, { onUpdated })
          target.select('b')
          expect(onUpdated).toHaveBeenCalledTimes(1)
          target.multiSelect(['a', 'c'])
          expect(target.getSelectedList()).toEqual(['a', 'c'])
          expect(onUpdated).toHaveBeenCalledTimes(2)
          // idempotent
          target.multiSelect(['a', 'c'])
          expect(target.getSelectedList()).toEqual(['a', 'c'])
          expect(onUpdated).toHaveBeenCalledTimes(3)
        })
      })

      describe('when ctrl is true', () => {
        it('should add the ids if some of the ids have not been selected yet', () => {
          const target = itemSelectable(() => items)
          target.multiSelect(['a'], true)
          expect(target.getSelectedList()).toEqual(['a'])
          target.multiSelect(['b'], true)
          expect(target.getSelectedList()).toEqual(['a', 'b'])
          target.multiSelect(['a', 'c'], true)
          expect(target.getSelectedList()).toEqual(['a', 'b', 'c'])
        })
        it('should remove the ids if all of its have been selected already', () => {
          const target = itemSelectable(() => items)
          target.multiSelect(['a', 'b', 'c'], true)
          target.multiSelect(['a', 'c'], true)
          expect(target.getSelectedList()).toEqual(['b'])
        })
      })
    })

    describe('isAllSelected', () => {
      it('should return true if all items are selected', () => {
        const target = itemSelectable(() => items)
        target.selectAll()
        expect(target.isAllSelected()).toBe(true)
      })
      it('should return false if some items are not selected', () => {
        const target = itemSelectable(() => items)
        target.select('a')
        expect(target.isAllSelected()).toBe(false)
      })
      it('should return false if no item exists', () => {
        const target = itemSelectable(() => ({}))
        expect(target.isAllSelected()).toBe(false)
      })
    })

    describe('selectAll', () => {
      it('should select all items', () => {
        const onUpdated = jest.fn()
        const target = itemSelectable(() => items, { onUpdated })
        target.selectAll()
        expect(target.getSelectedList()).toEqual(['a', 'b', 'c'])
        expect(onUpdated).toHaveBeenCalledTimes(1)
      })
      it('should toggle select all items if toggle = true', () => {
        const target = itemSelectable(() => items)
        target.select('a')
        target.selectAll(true)
        expect(target.getSelectedList()).toEqual(['a', 'b', 'c'])
        target.selectAll(true)
        expect(target.getSelectedList()).toEqual([])
      })
    })

    describe('clear', () => {
      it('should clear the item', () => {
        const onUpdated = jest.fn()
        const target = itemSelectable(() => items, { onUpdated })
        target.selectAll()
        expect(target.getSelectedList()).toEqual(['a', 'b', 'c'])
        target.clear('b')
        expect(target.getSelectedList()).toEqual(['a', 'c'])
        expect(onUpdated).toHaveBeenCalledTimes(2)
      })
    })

    describe('clearAll', () => {
      it('should clear all selections', () => {
        const onUpdated = jest.fn()
        const target = itemSelectable(() => items, { onUpdated })
        target.selectAll()
        expect(target.getSelectedList()).toEqual(['a', 'b', 'c'])
        target.clearAll()
        expect(target.getSelectedList()).toEqual([])
        expect(onUpdated).toHaveBeenCalledTimes(2)
      })
    })

    describe('getSelected', () => {
      it('should return selected ids as an object', () => {
        const target = itemSelectable(() => items)
        target.select('a')
        expect(target.getSelected()).toEqual({
          a: true,
        })
      })
    })

    describe('getSelectedItems', () => {
      it('should return selected items as an object', () => {
        const target = itemSelectable(() => items)
        target.select('a')
        expect(target.getSelectedItems()).toEqual({
          a: { id: 'a' },
        })
      })
    })
  })
})
