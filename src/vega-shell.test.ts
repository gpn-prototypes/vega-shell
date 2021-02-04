describe('точка входа', () => {
  const mountNode = document.createElement('div');

  mountNode.id = 'root';

  document.body.appendChild(mountNode);

  test('запускается без ошибок', async () => {
    await import('./vega-shell');
    expect(mountNode).toBeInTheDocument();
  });
});
