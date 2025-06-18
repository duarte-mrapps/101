#!/bin/bash

ANDROID_TEST_BUILD_PATH="./android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk"
IOS_TEST_BUILD_PATH="./ios/build/Build/Products/Debug-iphonesimulator/appdaloja.app"

iphone_device_name="iPhone 16 Pro"
iphone_device_id=$(xcrun simctl list devices | grep "$iphone_device_name" | grep -oE '\([A-F0-9\-]+\)' | tr -d '()')

iPad_device_name="iPad Pro 13-inch (M4)"
iPad_device_id=$(xcrun simctl list devices | grep "$iPad_device_name" | grep -oE '\([A-F0-9\-]+\)' | tr -d '()')

build_android() {
  echo "Verificando se o build de teste do Android existe..."

  if [ ! -f "$ANDROID_TEST_BUILD_PATH" ]; then
    echo "Build de teste do Android não encontrado. Criando build de teste para o Android..."

    if detox build --configuration android.debug; then
      echo "Build de teste para o Android concluído com sucesso."
    else
      echo "Erro ao criar o build de teste do Android"
      exit 1
    fi
  else
    echo "Build de teste do Android já existe. Prosseguindo..."
  fi
}

build_ios() {
  echo "Verificando se o build de teste do iOS existe..."
  
  xcrun simctl boot $iphone_device_id
  xcrun simctl boot $iPad_device_id

  if [ ! -d "$IOS_TEST_BUILD_PATH" ]; then
    echo "Build de teste do iOS não encontrado. Criando build de teste para o iOS..."

    if detox build --configuration iphone.debug; then
      echo "Build de teste para o iOS concluído com sucesso."
    else
      echo "Erro ao criar o build de teste do iOS"
      exit 1
    fi
  else
    echo "Build de teste do iOS já existe. Prosseguindo..."
  fi
}

if [[ "$1" == "--android" ]]; then
  build_android
elif [[ "$1" == "--ios" ]]; then
  build_ios
else
  echo "Por favor, passe a flag --android ou --ios para selecionar a plataforma."
  exit 1
fi
