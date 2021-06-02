describe('точка входа', () => {
  const mountNode = document.createElement('div');

  mountNode.id = 'root';

  document.body.appendChild(mountNode);

  beforeAll(() => {
    process.env.DISABLE_SSO = 'true';
  });

  test('запускается без ошибок', async () => {
    await import('./vega-shell');
    expect(mountNode).toBeInTheDocument();
  });
});
