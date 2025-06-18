import { device, by, element } from 'detox';

describe('Example', () => {
  beforeAll(async () => {
    await device.launchApp({
      launchArgs: { isTesting: true },
      delete: true,
    });
  });

  it('should take screenshots of all screens', async () => {
    await new Promise(resolve => setTimeout(resolve, 8000));
    await device.takeScreenshot('01')

    await element(by.label('SearchTab')).tap()
    waitFor(element(by.label('SearchItem-0'))).toBeVisible()
    await new Promise(resolve => setTimeout(resolve, 2000));
    await device.takeScreenshot('02')

    await element(by.label('SearchItem-0')).tap()
    await new Promise(resolve => setTimeout(resolve, 2000));
    await device.takeScreenshot('03')

    await device.pressBack()

    await waitFor(element(by.label('AccountTab'))).toBeVisible().withTimeout(20000);
    await element(by.label('AccountTab')).tap()

    await new Promise(resolve => setTimeout(resolve, 500));
    await device.takeScreenshot('04')

    await device.uninstallApp()
  });
});
