import { useGenericsSelectable } from '../src/genericsSelectable'

describe('src/genericsSelectable.ts', () => {
  describe('useGenericsSelectable', () => {
    const items = {
      a: { id: 'a', type: 's' },
      b: { id: 'b', type: 's' },
      c: { id: 'c', type: 't' },
    } as const
    const getItemType = (item: any) => item.type
    const attrKeys = { s: ['x', 'y'], t: ['p', 'q'] }

    describe('isAttrsSelected', () => {
      it('should return true if all attrs in the arg have been selected', () => {
        const target = useGenericsSelectable(() => items, getItemType, attrKeys)
        expect(
          target.isAttrsSelected({
            a: { type: 's', attrs: { x: true, y: true } },
          })
        ).toBe(false)
        target.select('a', 's', 'x', true)
        target.select('c', 't', 'p', true)
        expect(
          target.isAttrsSelected({
            a: { type: 's', attrs: { x: true, y: true } },
          })
        ).toBe(false)
        target.select('a', 's', 'y', true)
        expect(
          target.isAttrsSelected({
            a: { type: 's', attrs: { x: true, y: true } },
          })
        ).toBe(true)
      })
    })

    describe('select', () => {
      describe('when ctrl is false', () => {
        it('should replace selected attrs with new status', () => {
          const onUpdated = jest.fn()
          const target = useGenericsSelectable(
            () => items,
            getItemType,
            attrKeys,
            {
              onUpdated,
            }
          )
          expect(target.getSelected()).toEqual({})
          target.select('a', 's', 'x')
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { x: true } },
          })
          expect(target.getLastSelected()).toBe('a')
          expect(onUpdated).toHaveBeenCalledTimes(1)
          // replace
          target.select('a', 's', 'y')
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { y: true } },
          })
          target.select('b', 't', 'p')
          expect(target.getSelected()).toEqual({
            b: { type: 't', attrs: { p: true } },
          })
          expect(target.getLastSelected()).toBe('b')
          // idempotent
          target.select('b', 't', 'p')
          expect(target.getSelected()).toEqual({
            b: { type: 't', attrs: { p: true } },
          })
        })
      })

      describe('when ctrl is true', () => {
        it('should add the status if it has not been saved', () => {
          const target = useGenericsSelectable(
            () => items,
            getItemType,
            attrKeys
          )
          target.select('a', 's', 'x', true)
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { x: true } },
          })
          target.select('c', 's', 'y', true)
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { x: true } },
            c: { type: 's', attrs: { y: true } },
          })
        })
        it('should remove the status if it has been saved', () => {
          const target = useGenericsSelectable(
            () => items,
            getItemType,
            attrKeys
          )
          target.select('a', 's', 'x', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('c', 's', 'x', true)
          expect(target.getLastSelected()).toBe('c')

          target.select('c', 's', 'y', true)
          expect(target.getLastSelected()).toBe('c')

          target.select('a', 's', 'y', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('c', 's', 'y', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('a', 's', 'x', true)
          expect(target.getLastSelected()).toBe('a')

          target.select('c', 's', 'x', true)
          expect(target.getLastSelected()).toBe('a')
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { y: true } },
          })

          target.select('c', 's', 'x', true)
          expect(target.getLastSelected()).toBe('c')
          target.select('c', 's', 'x', true)
          expect(target.getLastSelected()).toBe('a')
        })
      })
    })

    describe('multiSelect', () => {
      describe('when ctrl is false', () => {
        it('should select multi attrs', () => {
          const onUpdated = jest.fn()
          const target = useGenericsSelectable(
            () => items,
            getItemType,
            attrKeys,
            {
              onUpdated,
            }
          )

          target.multiSelect({
            a: { type: 's', attrs: { x: true } },
            c: { type: 't', attrs: { q: true } },
          })
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { x: true } },
            c: { type: 't', attrs: { q: true } },
          })
          expect(onUpdated).toHaveBeenCalledTimes(1)

          target.multiSelect({
            a: { type: 's', attrs: { y: true } },
          })
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { y: true } },
          })
          expect(onUpdated).toHaveBeenCalledTimes(2)

          target.multiSelect({
            a: { type: 's', attrs: { y: true } },
          })
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { y: true } },
          })
          expect(onUpdated).toHaveBeenCalledTimes(3)
        })
      })

      describe('when ctrl is true', () => {
        it('should toggle multi attrs', () => {
          const onUpdated = jest.fn()
          const target = useGenericsSelectable(
            () => items,
            getItemType,
            attrKeys,
            {
              onUpdated,
            }
          )

          target.multiSelect(
            {
              a: { type: 's', attrs: { x: true } },
              c: { type: 't', attrs: { q: true } },
            },
            true
          )
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { x: true } },
            c: { type: 't', attrs: { q: true } },
          })
          expect(onUpdated).toHaveBeenCalledTimes(1)

          target.multiSelect(
            {
              a: { type: 's', attrs: { x: true, y: true } },
            },
            true
          )
          expect(target.getSelected()).toEqual({
            a: { type: 's', attrs: { x: true, y: true } },
            c: { type: 't', attrs: { q: true } },
          })
          expect(onUpdated).toHaveBeenCalledTimes(2)

          target.multiSelect(
            {
              a: { type: 's', attrs: { x: true, y: true } },
            },
            true
          )
          expect(target.getSelected()).toEqual({
            c: { type: 't', attrs: { q: true } },
          })
          expect(onUpdated).toHaveBeenCalledTimes(3)
        })
      })
    })

    describe('selectAll', () => {
      it('should select all', () => {
        const onUpdated = jest.fn()
        const target = useGenericsSelectable(
          () => items,
          getItemType,
          attrKeys,
          { onUpdated }
        )
        target.selectAll()
        expect(target.getSelected()).toEqual({
          a: { type: 's', attrs: { x: true, y: true } },
          b: { type: 's', attrs: { x: true, y: true } },
          c: { type: 't', attrs: { p: true, q: true } },
        })
        expect(onUpdated).toHaveBeenCalledTimes(1)
      })
      it('should clear all selected if toggle = true and all attrs have been selected already', () => {
        const onUpdated = jest.fn()
        const target = useGenericsSelectable(
          () => items,
          getItemType,
          attrKeys,
          { onUpdated }
        )
        target.selectAll()
        expect(onUpdated).toHaveBeenCalledTimes(1)
        target.clear('a', 'y')
        expect(target.getSelected()).toEqual({
          a: { type: 's', attrs: { x: true } },
          b: { type: 's', attrs: { x: true, y: true } },
          c: { type: 't', attrs: { p: true, q: true } },
        })
        expect(onUpdated).toHaveBeenCalledTimes(2)
        target.selectAll(true)
        expect(target.getSelected()).toEqual({
          a: { type: 's', attrs: { x: true, y: true } },
          b: { type: 's', attrs: { x: true, y: true } },
          c: { type: 't', attrs: { p: true, q: true } },
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
        const target = useGenericsSelectable(
          () => items,
          getItemType,
          attrKeys,
          { onUpdated }
        )
        target.select('a', 's', 'x', true)
        target.select('a', 's', 'y', true)
        target.select('c', 't', 'p', true)
        expect(target.getSelected()).toEqual({
          a: { type: 's', attrs: { x: true, y: true } },
          c: { type: 't', attrs: { p: true } },
        })
        expect(target.getLastSelected()).toBe('c')

        onUpdated.mockClear()
        target.clear('a', 'y')
        expect(target.getSelected()).toEqual({
          a: { type: 's', attrs: { x: true } },
          c: { type: 't', attrs: { p: true } },
        })
        expect(onUpdated).toHaveBeenCalledTimes(1)
        expect(target.getLastSelected()).toBe('c')

        target.clear('c', 'p')
        expect(target.getSelected()).toEqual({
          a: { type: 's', attrs: { x: true } },
        })
        expect(onUpdated).toHaveBeenCalledTimes(2)
        expect(target.getLastSelected()).toBe('a')
      })
    })

    describe('clearAll', () => {
      it('should clear all selected', () => {
        const onUpdated = jest.fn()
        const target = useGenericsSelectable(
          () => items,
          getItemType,
          attrKeys,
          { onUpdated }
        )
        target.selectAll()
        expect(target.getSelected()).toEqual({
          a: { type: 's', attrs: { x: true, y: true } },
          b: { type: 's', attrs: { x: true, y: true } },
          c: { type: 't', attrs: { p: true, q: true } },
        })
        expect(onUpdated).toHaveBeenCalledTimes(1)

        target.clearAll()
        expect(target.getSelected()).toEqual({})
        expect(onUpdated).toHaveBeenCalledTimes(2)
      })
    })
  })
})
