/** @type {Detox.DetoxConfig} */
module.exports = {
    testRunner: {
      args: {
        '$0': 'jest',
        config: 'e2e/jest.config.js'
      },
      jest: {
        setupTimeout: 120000
      }
    },
    apps: {
      'ios.debug': {
        type: 'ios.app',
        binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/appdaloja.app',
        build: 'xcodebuild -workspace ios/appdaloja.xcworkspace -scheme appdaloja -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
      },
      'ios.release': {
        type: 'ios.app',
        binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/appdaloja.app',
        build: 'xcodebuild -workspace ios/appdaloja.xcworkspace -scheme appdaloja -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
      },
      'android.debug': {
        type: 'android.apk',
        binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
        build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
        reversePorts: [
          8081
        ]
      },
      'android.release': {
        type: 'android.apk',
        binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
        build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release'
      }
    },
    devices: {
      iphone: {
        type: 'ios.simulator',
        device: {
          type: 'iPhone 16 Pro'
        }
      },
      ipad: {
        type: 'ios.simulator',
        device: {
          type: 'iPad Pro 13-inch (M4)'
        }
      },
      android: {
        type: 'android.emulator',
        device: {
          avdName: 'Pixel_6_Pro_API_35',
        }
      },
      "android.tablet": {
        "type": "android.emulator",
        "device": {
          avdName: "10.1_WXGA_Tablet_API_35"
        }
      }
    },
    configurations: {
      'iphone.debug': {
        device: 'iphone',
        app: 'ios.debug',
        artifacts: {
          rootDir: "./prints/ios iphones",
        }
      },
      'iphone.release': {
        device: 'iphone',
        app: 'ios.release',
        artifacts: {
          rootDir: "./prints/ios iphones",
        }
      },
      'ipad.debug': {
        device: 'ipad',
        app: 'ios.debug',
        artifacts: {
          rootDir: "./prints/ios ipad",
        }
      },
      'ipad.release': {
        device: 'ipad',
        app: 'ios.release',
        artifacts: {
          rootDir: "./prints/ios ipad",
        }
      },
      'android.debug': {
        device: 'android',
        app: 'android.debug',
        artifacts: {
          rootDir: "./prints/google pixel 7 pro",
        }
      },
      'android.release': {
        device: 'android',
        app: 'android.release',
        artifacts: {
          rootDir: "./prints/google pixel 7 pro",
        }
      },
  
      "tablet.debug": {
        device: "android.tablet",
        app: "android.debug",
        artifacts: {
          rootDir: "./prints/samsung galaxy tab s8 ultra",
        }
      },
      "tablet.release": {
        device: "android.tablet",
        app: "android.release",
        artifacts: {
          rootDir: "./prints/samsung galaxy tab s8 ultra",
        }
      }
    }
  };
  