import { v4 as uuid } from 'uuid';

import { CurrentProject, FindProjectResult, FindProjectResultCode } from './current-project';

describe('CurrentProject', () => {
  let project: CurrentProject;
  const findProject = jest.fn<Promise<FindProjectResult>, any[]>();

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

    findProject.mockResolvedValueOnce({
      code: FindProjectResultCode.Success,
      project: { vid, version: 1 },
    });

    const checkout = project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.InProgress, vid });

    await checkout;

    expect(project.status()).toStrictEqual({
      code: project.codes.Done,
      project: { vid, version: 1 },
    });
  });

  test('проект не найден', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({ code: FindProjectResultCode.NotFound });
    await project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.NotFound, vid });
  });

  test('ошибка при запросе проекта', async () => {
    const vid = uuid();

    findProject.mockRejectedValueOnce(new Error('test'));
    await project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.Error, vid });
  });

  test('ошибка в ответе', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({ code: FindProjectResultCode.Error });
    await project.checkout(vid);

    expect(project.status()).toStrictEqual({ code: project.codes.Error, vid });
  });

  test('сброс активного проекта', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({
      code: FindProjectResultCode.Success,
      project: { vid, version: 1 },
    });

    await project.checkout(vid);
    project.release();

    expect(project.status()).toStrictEqual({ code: project.codes.Idle });
  });

  test('если проект не задан, то возвращается статус по умолчанию', () => {
    expect(project.status()).toMatchObject({ code: project.codes.Idle });
  });

  test('возвращает данные выбранного проекта', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({
      code: FindProjectResultCode.Success,
      project: { vid, version: 1 },
    });

    expect(project.get()).toBe(null);

    await project.checkout(vid);

    expect(project.get()).toStrictEqual({ vid, version: 1 });
  });
});
