import { v4 as uuid } from 'uuid';

import { CurrentProject, FindProjectResult, FindProjectResultCode } from './current-project';

describe('CurrentProject', () => {
  let project: CurrentProject;
  const findProject = jest.fn<Promise<FindProjectResult>, any[]>();
  const onStatusChange = jest.fn();

  beforeEach(() => {
    findProject.mockClear();
    onStatusChange.mockClear();
    project = new CurrentProject({
      findProject,
      onStatusChange,
    });
  });

  test('проект переключается', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({
      code: FindProjectResultCode.Success,
      project: { vid, version: 1 },
    });

    const checkout = project.checkout(vid);

    const inProgressStatus = { code: project.codes.InProgress, vid };
    expect(onStatusChange).toHaveBeenLastCalledWith(inProgressStatus);
    expect(project.status()).toStrictEqual(inProgressStatus);

    await checkout;

    const doneStatus = {
      code: project.codes.Done,
      project: { vid, version: 1 },
    };

    expect(onStatusChange).toHaveBeenLastCalledWith(doneStatus);
    expect(project.status()).toStrictEqual(doneStatus);
  });

  test('проект не найден', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({ code: FindProjectResultCode.NotFound });
    await project.checkout(vid);

    const notFoundStatus = { code: project.codes.NotFound, vid };
    expect(onStatusChange).toHaveBeenLastCalledWith(notFoundStatus);
    expect(project.status()).toStrictEqual(notFoundStatus);
  });

  test('ошибка при запросе проекта', async () => {
    const vid = uuid();

    findProject.mockRejectedValueOnce(new Error('test'));
    await project.checkout(vid);

    const errorStatus = { code: project.codes.Error, vid };

    expect(onStatusChange).toHaveBeenLastCalledWith(errorStatus);
    expect(project.status()).toStrictEqual(errorStatus);
  });

  test('ошибка в ответе', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({ code: FindProjectResultCode.Error });
    await project.checkout(vid);

    const errorStatus = { code: project.codes.Error, vid };

    expect(onStatusChange).toHaveBeenLastCalledWith(errorStatus);
    expect(project.status()).toStrictEqual(errorStatus);
  });

  test('сброс активного проекта', async () => {
    const vid = uuid();

    findProject.mockResolvedValueOnce({
      code: FindProjectResultCode.Success,
      project: { vid, version: 1 },
    });

    await project.checkout(vid);
    project.release();

    const idleStatus = { code: project.codes.Idle };
    expect(onStatusChange).toHaveBeenLastCalledWith(idleStatus);
    expect(project.status()).toStrictEqual(idleStatus);
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

  test('статус нельзя изменить', async () => {
    const vid = uuid();

    function assertStatusMutationFails() {
      const status = project.status();
      expect(() => {
        // @ts-expect-error: специальная попытка мутировать невалидным статусом
        // eslint-disable-next-line no-param-reassign
        status.code = '';
      }).toThrow();
    }

    assertStatusMutationFails();

    findProject.mockResolvedValueOnce({
      code: FindProjectResultCode.Success,
      project: { vid, version: 1 },
    });

    const checkout = project.checkout(vid);

    assertStatusMutationFails();

    await checkout;

    assertStatusMutationFails();

    findProject.mockResolvedValueOnce({ code: FindProjectResultCode.NotFound });
    await project.checkout(vid);

    assertStatusMutationFails();

    findProject.mockResolvedValueOnce({ code: FindProjectResultCode.Error });
    await project.checkout(vid);

    assertStatusMutationFails();

    findProject.mockRejectedValueOnce({ code: FindProjectResultCode.Error });
    await project.checkout(vid);

    assertStatusMutationFails();
  });
});
