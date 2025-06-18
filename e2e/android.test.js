import { device, by, element } from 'detox';

describe('Example', () => {
  beforeAll(async () => { await device.launchApp(); await new Promise(resolve => setTimeout(resolve, 1000)) });

  it('should take screenshots of all screens', async () => {
    try {
      await waitFor(element(by.text('Não'))).toBeVisible().withTimeout(20000)
      await element(by.text('Não')).tap()
    } catch (error) { }

    try {
      await waitFor(element(by.id('MainCarrousel'))).toBeVisible().withTimeout(20000)
      await element(by.id('MainCarrousel')).swipe('right', 'fast')
    } catch (error) { }

    try {
      await waitFor(element(by.id('MainTab'))).toBeVisible().withTimeout(20000);
      await expect(element(by.id('MainTab'))).toBeVisible();
      await device.takeScreenshot('01')
    } catch (error) { }

    try {
      await expect(element(by.id('SearchTab'))).toBeVisible();
      await element(by.id('SearchTab')).tap()
      await device.takeScreenshot('02')
    } catch (error) { }

    try {
      await waitFor(element(by.id('SearchItem-0'))).toBeVisible().withTimeout(20000);
      await expect(element(by.id('SearchItem-0'))).toBeVisible();
      await element(by.id('SearchItem-0')).tap()
      await device.takeScreenshot('03')
    } catch (error) { }

    try {
      await device.pressBack()
    } catch (error) { }

    try {
      await waitFor(element(by.id('AccountTab'))).toBeVisible().withTimeout(20000);
      await expect(element(by.id('AccountTab'))).toBeVisible();
      await element(by.id('AccountTab')).tap()
      await device.takeScreenshot('04')
    } catch (error) { }
  });
});
