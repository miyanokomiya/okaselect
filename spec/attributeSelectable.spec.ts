import { useAttributeSelectable } from '../src/attributeSelectable'

describe('src/attributeSelectable.ts', () => {
  describe('useAttributeSelectable', () => {
    const items = {
      a: { id: 'a' },
      b: { id: 'b' },
      c: { id: 'c' },
    }
    const attrKeys = ['x', 'y']

    describe('select', () => {
      describe('when ctrl is false', () => {
        it('should replace selected attrs with new status', () => {
          const onUpdated = jest.fn()
          const target = useAttributeSelectable(() => items, attrKeys, {
            onUpdated,
          })
          expect(target.getSelected()).toEqual({})
          target.select('a', 'a_0')
          expect(target.getSelected()).toEqual({ a: { a_0: true } })
          expect(target.getLastSelected()).toBe('a')
          expect(onUpdated).toHaveBeenCalledTimes(1)
          // replace
          target.select('a', 'a_1')
          expect(target.getSelected()).toEqual({ a: { a_1: true } })
          target.select('b', 'b_1')
          expect(target.getSelected()).toEqual({ b: { b_1: true } })
          expect(target.getLastSelected()).toBe('b')
          // idempotent
          target.select('b', 'b_1')
          expect(target.getSelected()).toEqual({ b: { b_1: true } })
        })
      })

      describe('when ctrl is true', () => {
        it('should add the status if it has not been saved', () => {
          const target = useAttributeSelectable(() => items, attrKeys)
          target.select('a', 'a_0', true)
          expect(target.getSelected()).toEqual({ a: { a_0: true } })
          target.select('c', 'c_0', true)
          expect(target.getSelected()).toEqual({
            a: { a_0: true },
            c: { c_0: true },
          })
        })
        it('should remove the status if it has been saved', () => {
          const target = useAttributeSelectable(() => items, attrKeys)
          target.select('a', 'a_0', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('c', 'c_0', true)
          expect(target.getLastSelected()).toBe('c')

          target.select('c', 'c_1', true)
          expect(target.getLastSelected()).toBe('c')

          target.select('a', 'a_1', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('c', 'c_1', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('a', 'a_0', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('c', 'c_0', true)
          expect(target.getLastSelected()).toBe('a')
          expect(target.getSelected()).toEqual({
            a: { a_1: true },
          })

          target.select('c', 'c_0', true)
          expect(target.getLastSelected()).toBe('c')
          target.select('c', 'c_0', true)
          expect(target.getLastSelected()).toBe('a')
        })
      })
    })

    describe('multiSelect', () => {
      describe('when ctrl is false', () => {
        it('should select multi attrs', () => {
          const onUpdated = jest.fn()
          const target = useAttributeSelectable(() => items, attrKeys, {
            onUpdated,
          })

          target.multiSelect({ a: { x: true }, c: { y: true } })
          expect(target.getSelected()).toEqual({
            a: { x: true },
            c: { y: true },
          })
          expect(onUpdated).toHaveBeenCalledTimes(1)

          target.multiSelect({ a: { y: true } })
          expect(target.getSelected()).toEqual({
            a: { y: true },
          })
          expect(onUpdated).toHaveBeenCalledTimes(2)

          target.multiSelect({ a: { y: true } })
          expect(target.getSelected()).toEqual({
            a: { y: true },
          })
          expect(onUpdated).toHaveBeenCalledTimes(3)
        })
      })

      describe('when ctrl is true', () => {
        it('should toggle multi attrs', () => {
          const onUpdated = jest.fn()
          const target = useAttributeSelectable(() => items, attrKeys, {
            onUpdated,
          })

          target.multiSelect({ a: { x: true }, c: { y: true } }, true)
          expect(target.getSelected()).toEqual({
            a: { x: true },
            c: { y: true },
          })
          expect(onUpdated).toHaveBeenCalledTimes(1)

          target.multiSelect({ a: { x: true, y: true } }, true)
          expect(target.getSelected()).toEqual({
            a: { x: true, y: true },
            c: { y: true },
          })
          expect(onUpdated).toHaveBeenCalledTimes(2)

          target.multiSelect({ a: { x: true, y: true } }, true)
          expect(target.getSelected()).toEqual({
            c: { y: true },
          })
          expect(onUpdated).toHaveBeenCalledTimes(3)
        })
      })

      describe('when a map is passed', () => {
        it('should keep the order', () => {
          const onUpdated = jest.fn()
          const target = useAttributeSelectable(() => items, attrKeys, {
            onUpdated,
          })
          const map = new Map<string, { [key: string]: true }>([
            ['c', { y: true }],
            ['a', { x: true }],
            ['b', { y: true }],
          ])

          target.multiSelect(map)
          expect(target.getSelected()).toEqual({
            c: { y: true },
            a: { x: true },
            b: { y: true },
          })
          expect(target.getLastSelected()).toBe('b')
          expect(onUpdated).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe('getAllAttrsSelected', () => {
      it('should return ids of items whose all attrs have been selected', () => {
        const target = useAttributeSelectable(() => items, attrKeys)
        expect(target.getAllAttrsSelected()).toEqual([])
        target.select('a', 'x', true)
        expect(target.getAllAttrsSelected()).toEqual([])
        target.select('a', 'y', true)
        expect(target.getAllAttrsSelected()).toEqual(['a'])
        target.select('c', 'x', true)
        expect(target.getAllAttrsSelected()).toEqual(['a'])
        target.select('c', 'y', true)
        expect(target.getAllAttrsSelected()).toEqual(['a', 'c'])
      })
    })

    describe('isAllSelected', () => {
      it('should return true if all attrs of each items have been selected', () => {
        const target = useAttributeSelectable(() => items, attrKeys)
        expect(target.isAllSelected()).toBe(false)
        target.select('a', 'x', true)
        expect(target.isAllSelected()).toBe(false)
        target.select('a', 'y', true)
        target.select('b', 'x', true)
        target.select('b', 'y', true)
        target.select('c', 'x', true)
        expect(target.isAllSelected()).toBe(false)
        target.select('c', 'y', true)
        expect(target.isAllSelected()).toBe(true)
      })
    })

    describe('isAnySelected', () => {
      it('should return true if any attrs have been selected', () => {
        const target = useAttributeSelectable(() => items, attrKeys)
        expect(target.isAnySelected()).toBe(false)
        target.select('a', 'x')
        expect(target.isAnySelected()).toBe(true)
      })
    })

    describe('isAttrsSelected', () => {
      it('should return true if all attrs in the arg have been selected', () => {
        const target = useAttributeSelectable(() => items, attrKeys)
        expect(target.isAttrsSelected({ a: { x: true, y: true } })).toBe(false)
        target.select('a', 'x', true)
        target.select('c', 'x', true)
        expect(target.isAttrsSelected({ a: { x: true, y: true } })).toBe(false)
        target.select('a', 'y', true)
        expect(target.isAttrsSelected({ a: { x: true, y: true } })).toBe(true)
      })
    })

    describe('selectAll', () => {
      it('should select all', () => {
        const onUpdated = jest.fn()
        const target = useAttributeSelectable(() => items, attrKeys, {
          onUpdated,
        })
        target.selectAll()
        expect(target.getSelected()).toEqual({
          a: { x: true, y: true },
          b: { x: true, y: true },
          c: { x: true, y: true },
        })
        expect(onUpdated).toHaveBeenCalledTimes(1)
      })
      it('should clear all selected if toggle = true and all attrs have been selected already', () => {
        const onUpdated = jest.fn()
        const target = useAttributeSelectable(() => items, attrKeys, {
          onUpdated,
        })
        target.selectAll()
        expect(onUpdated).toHaveBeenCalledTimes(1)
        target.clear('a', 'y')
        expect(target.getSelected()).toEqual({
          a: { x: true },
          b: { x: true, y: true },
          c: { x: true, y: true },
        })
        expect(onUpdated).toHaveBeenCalledTimes(2)
        target.selectAll(true)
        expect(target.getSelected()).toEqual({
          a: { x: true, y: true },
          b: { x: true, y: true },
          c: { x: true, y: true },
        })
        expect(onUpdated).toHaveBeenCalledTimes(3)
        target.selectAll(true)
        expect(target.getSelected()).toEqual({})
        expect(onUpdated).toHaveBeenCalledTimes(4)
      })
    })

    describe('clear', () => {
      it('should clear the attr', () => {
        const onUpdated = jest.fn()
        const target = useAttributeSelectable(() => items, attrKeys, {
          onUpdated,
        })
        target.select('a', 'a_0', true)
        target.select('a', 'a_1', true)
        target.select('c', 'c_0', true)
        expect(target.getSelected()).toEqual({
          a: { a_0: true, a_1: true },
          c: { c_0: true },
        })
        expect(target.getLastSelected()).toBe('c')

        onUpdated.mockClear()
        target.clear('a', 'a_1')
        expect(target.getSelected()).toEqual({
          a: { a_0: true },
          c: { c_0: true },
        })
        expect(onUpdated).toHaveBeenCalledTimes(1)
        expect(target.getLastSelected()).toBe('c')

        target.clear('c', 'c_0')
        expect(target.getSelected()).toEqual({
          a: { a_0: true },
        })
        expect(onUpdated).toHaveBeenCalledTimes(2)
        expect(target.getLastSelected()).toBe('a')
      })
    })

    describe('clearAll', () => {
      it('should clear all selected', () => {
        const onUpdated = jest.fn()
        const target = useAttributeSelectable(() => items, attrKeys, {
          onUpdated,
        })
        target.selectAll()
        expect(target.getSelected()).toEqual({
          a: { x: true, y: true },
          b: { x: true, y: true },
          c: { x: true, y: true },
        })
        expect(onUpdated).toHaveBeenCalledTimes(1)

        target.clearAll()
        expect(target.getSelected()).toEqual({})
        expect(onUpdated).toHaveBeenCalledTimes(2)
      })
    })

    describe('createSnapshot & restore', () => {
      it('should create snapshot and restore from it', () => {
        const onUpdated = jest.fn()
        const target = useAttributeSelectable(() => items, attrKeys, {
          onUpdated,
        })
        target.selectAll()
        const snapshot = target.createSnapshot()
        expect(snapshot).toEqual([
          ['a', { x: true, y: true }],
          ['b', { x: true, y: true }],
          ['c', { x: true, y: true }],
        ])
        target.clearAll()
        expect(target.getSelected()).toEqual({})
        onUpdated.mockClear()
        target.restore(snapshot)
        expect(target.getSelected()).toEqual({
          a: { x: true, y: true },
          b: { x: true, y: true },
          c: { x: true, y: true },
        })
        expect(onUpdated).toHaveBeenCalledTimes(1)
      })
    })
  })
})
