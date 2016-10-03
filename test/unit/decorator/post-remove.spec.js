import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {PostRemove} from '../../../src/decorator/post-remove';
import {REMOVED} from '../../../src/symbols';
import {createEntityManagerStub} from '../helper';

@Entity
class Foo {
  @Id
  key;
  removed = undefined;

  @PostRemove
  trigger() {
    this.removed = this[REMOVED];
  }
}

describe('@PostRemove', () => {
  let entityManager;
  let foo;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {key: 123})
        .then(f => {
          foo = f;
          return entityManager.persist(foo);
        });
  });

  it('Remove', () => {
    return entityManager.remove(foo)
      .then(f => {
        expect(f.trigger).toBeUndefined();
        expect(f.removed).toEqual(true);
      });
  });

  it('Invalid usage', () => {
    expect(() => {
      @Entity class Bar {
        @PostRemove prop = 'val';
      }
    }).toThrowError('@PostRemove prop is not a function');
  });
});
