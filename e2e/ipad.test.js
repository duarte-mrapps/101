import { device, by, element } from 'detox';

describe('Example', () => {
  beforeAll(async () => { await device.launchApp(); });

  it('should take screenshots of all screens', async () => {
    try {
      await waitFor(element(by.text('Não'))).toBeVisible().withTimeout(20000)
      await element(by.text('Não')).tap()
    } catch (error) { }

    try {
      await element(by.id('MainCarrousel')).swipe('right', 'fast')
      await device.takeScreenshot('01')
    } catch (error) { }

    try {
      await waitFor(element(by.text('Estoque'))).toBeVisible().withTimeout(20000);
      await expect(element(by.text('Estoque'))).toBeVisible();
      await element(by.text('Estoque')).tap()
      await device.takeScreenshot('02')
    } catch (error) { }

    try {
      await waitFor(element(by.id('SearchItem-0'))).toBeVisible().withTimeout(20000);
      await expect(element(by.id('SearchItem-0'))).toBeVisible();
      await element(by.id('SearchItem-0')).tap()
      await device.takeScreenshot('03')
    } catch (error) { }

    try {
      await waitFor(element(by.text('Sobre nós'))).toBeVisible().withTimeout(20000);
      await expect(element(by.text('Sobre nós'))).toBeVisible();
      await element(by.text('Sobre nós')).tap()
      await device.takeScreenshot('04')
    } catch (error) { }
  });
});
