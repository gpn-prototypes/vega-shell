import { DocumentNode, gql, Operation, OperationVariables } from '@apollo/client';
import { createOperation as apolloCreateOperation } from '@apollo/client/link/utils';
import { getOperationName } from '@apollo/client/utilities';
import { v4 as uuid } from 'uuid';

import { ProjectOperations } from './project-operations';

function createOperation(params: {
  query: DocumentNode;
  variables?: OperationVariables;
  context?: any;
}): Operation {
  const operation = apolloCreateOperation(params?.context, {
    ...params,
  });

  (operation as any).operationName = getOperationName(operation.query) ?? undefined;

  return operation;
}

describe('ProjectOperations', () => {
  let vid: string;
  let sut: ProjectOperations;

  const query1 = gql`
    query TestQuery1 {
      a
    }
  `;

  const query2 = gql`
    query TestQuery2 {
      b
    }
  `;

  const query3 = gql`
    query {
      c
    }
  `;

  const query4 = gql`
    query {
      d
    }
  `;

  const operation1 = createOperation({ query: query1 });
  const operation2 = createOperation({ query: query2 });
  const operation3 = createOperation({ query: query3 });
  const operation4 = createOperation({ query: query4 });

  const ctx = {
    isCached: jest.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    vid = uuid();
    ctx.isCached.mockClear();
    sut = new ProjectOperations({ context: ctx });
  });

  test('возвращает устаревшие операции', () => {
    ctx.isCached.mockReturnValue(true);

    sut.track(vid, operation1);
    sut.track(vid, operation2);
    sut.track(vid, operation3);

    const staled = sut.markStaledAfterOperation(vid, operation3);

    expect(staled).toStrictEqual([operation1, operation2]);
  });

  test('не дублирует операции', () => {
    ctx.isCached.mockReturnValue(true);

    sut.track(vid, operation1);
    sut.track(vid, operation1);
    sut.track(vid, operation3);
    sut.track(vid, operation3);
    sut.track(vid, operation4);

    const staled = sut.markStaledAfterOperation(vid, operation4);

    expect(staled).toStrictEqual([operation1, operation3]);
  });

  test('если операции нет в кэше, то она удаляется', () => {
    sut.track(vid, operation1);
    sut.track(vid, operation2);
    sut.track(vid, operation3);

    ctx.isCached.mockImplementation((query) => query === operation1.query);

    const staled = sut.markStaledAfterOperation(vid, operation3);

    expect(staled).toStrictEqual([operation1]);
  });

  test('удаленные операции больше не отслеживаются', () => {
    ctx.isCached.mockReturnValue(true);

    sut.track(vid, operation1);
    sut.track(vid, operation2);
    sut.track(vid, operation3);
    sut.drop(vid, operation2);

    const staled = sut.markStaledAfterOperation(vid, operation3);

    expect(staled).toStrictEqual([operation1]);
  });

  test('операции не отслеживаются после очистки', () => {
    ctx.isCached.mockReturnValue(true);

    sut.track(vid, operation1);
    sut.track(vid, operation2);
    sut.track(vid, operation3);

    sut.clear(vid);

    const staled = sut.markStaledAfterOperation(vid, operation3);

    expect(staled).toStrictEqual([]);
  });

  test('если для проекта нет отслеживаемых операций, то возвращается пустой массив устаревших операций', () => {
    const staled = sut.markStaledAfterOperation(vid, operation1);
    expect(staled).toStrictEqual([]);
  });
});
