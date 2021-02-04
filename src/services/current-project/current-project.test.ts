import { v4 as uuid } from 'uuid';

import { CurrentProject, FindProjectResult } from './current-project';

describe('CurrentProject', () => {
  let project: CurrentProject;
  const findProject = jest.fn();

  beforeEach(() => {
    project = new CurrentProject({
      findProject,
    });
  });

  afterEach(() => {
    findProject.mockClear();
  });

  test('проект переключается', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce(FindProjectResult.SUCCESS);
    const checkout = project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.CHECKOUT, vid });

    await checkout;

    expect(project.status()).toStrictEqual({ code: project.codes.CHECKED, vid });
  });

  test('проект не найден', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce(FindProjectResult.NOT_FOUND);
    await project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.NOT_FOUND, vid });
  });

  test('ошибка при запросе проекта', async () => {
    const vid = uuid();

    findProject.mockRejectedValueOnce(new Error('test'));
    await project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.ERROR, vid });
  });

  test('ошибка в ответе', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce(FindProjectResult.ERROR);
    await project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.ERROR, vid });
  });

  test('сброс активного проекта', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce(vid);
    await project.checkout(vid);
    project.release();

    expect(project.status()).toStrictEqual({ code: project.codes.IDLE });
  });

  test('если проект не задан, то возвращается статус по умолчанию', () => {
    expect(project.status()).toMatchObject({ code: project.codes.IDLE });
  });
});
