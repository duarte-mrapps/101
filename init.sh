#!/bin/bash
# Limpa o terminal
clear

# Especifica os caminhos dos arquivos fixos
arquivos_account_id=(
  "./README.md"
  "./src/libs/session.js"
)
arquivos_onesignal_app_id=(
  "./README.md"
  "./src/libs/session.js"
)
arquivos_app_name=(
  "./README.md"
  "./android/app/src/main/res/values/strings.xml"
  "./ios/cardealer/Info.plist"
  "./ios/cardealer.xcodeproj/project.pbxproj"
)
arquivos_application_id=(
  "./README.md"
  "./android/app/build.gradle"
)
arquivos_bundle_id=(
  "./README.md"
  "./ios/cardealer/cardealer.entitlements"
  "./ios/cardealer.xcodeproj/project.pbxproj"
  "./ios/OneSignalNotificationServiceExtension/OneSignalNotificationServiceExtension.entitlements"
)
arquivos_colors_background=(
  "./android/app/src/main/res/values/ic_launcher_background.xml"
)

# Função para verificar se os arquivos existem
verificar_arquivos() {
  for arquivo in "${!1}"; do
    if [ ! -f "$arquivo" ]; then
      echo "Arquivo não encontrado: $arquivo"
      exit 1
    fi
  done
}

# Função para verificar se a palavra existe nos arquivos
verificar_palavra_existente() {
  local palavra=$1
  shift
  local arquivos=("$@")
  for arquivo in "${arquivos[@]}"; do
    if ! grep -q "$palavra" "$arquivo"; then
      echo "A palavra chave $palavra não foi encontrada no arquivo: $arquivo. Ignorando substituição."
      return 1
    fi
  done
  return 0
}

# Verifica se os arquivos existem
verificar_arquivos arquivos_account_id[@]
verificar_arquivos arquivos_onesignal_app_id[@]
verificar_arquivos arquivos_app_name[@]
verificar_arquivos arquivos_application_id[@]
verificar_arquivos arquivos_bundle_id[@]
verificar_arquivos arquivos_colors_background[@]

# Função para solicitar e validar entrada do usuário
solicitar_valor() {
  local prompt=$1
  local valor=""
  while true; do
    read -r -p "$prompt: " valor
    valor=$(echo "$valor" | xargs)
    if [[ -z "$valor" ]]; then
      echo "Este campo é obrigatório. Por favor, insira um valor."
    else
      read -p "Confirmar? [S/N]: " confirmacao
      if [[ "$confirmacao" =~ ^[Ss]$ ]]; then
        break
      fi
    fi
  done
  echo "$valor"
}

return_srgb() {
    # Função para verificar se a cor fornecida é válida
    is_valid_hex() {
        [[ $1 =~ ^#([0-9A-Fa-f]{6})$ ]]
    }

    # Verifica se a cor hex é válida
    if ! is_valid_hex "$1"; then
        echo "Cor hexadecimal inválida"
        return 1
    fi

    # Remove o caractere '#' da cor hexadecimal
    hex_color="${1#'#'}"

    # Extrai os valores de Red, Green e Blue
    red=$(echo "ibase=16; ${hex_color:0:2}" | bc)
    green=$(echo "ibase=16; ${hex_color:2:2}" | bc)
    blue=$(echo "ibase=16; ${hex_color:4:2}" | bc)

    # Converte os valores RGB para o intervalo [0, 1] (sRGB)
    red_srgb=$(echo "scale=18; $red / 255" | bc)
    green_srgb=$(echo "scale=18; $green / 255" | bc)
    blue_srgb=$(echo "scale=18; $blue / 255" | bc)

    # Retorna os valores
    echo "$red_srgb $green_srgb $blue_srgb"
}

echo "Configuração do aplicativo"
echo

# Solicita ao usuário os valores para cada palavra com descrições
echo "Arquivo do Firebase para Android (google-services.json)"
firebaseAndroidPath=$(solicitar_valor "Arraste e solte o arquivo aqui")
echo

echo "Arquivo do Firebase para iOS (GoogleService-Info.plist)"
firebaseIosPath=$(solicitar_valor "Arraste e solte o arquivo aqui")
echo

echo "Pasta contendo os ícones para o aplicativo (IconKitchen-Output)"
iconsPath=$(solicitar_valor "Arraste e solte a pasta aqui")
echo

echo "Cor de fundo do ícone do aplicativo"
echo "Informar o valor em hexadecimal, exemplo: #FFFFFF para branco)"
backgroundColor=$(solicitar_valor "Digite aqui")
echo

# Exibe um resumo dos dados informados
echo "Resumo"
echo "Confira atentamente todos os dados informados"
echo
echo "Arquivo do Firebase para Android (google-services.json)         : $firebaseAndroidPath"
echo "Arquivo do Firebase para iOS (GoogleService-Info.plist)         : $firebaseIosPath"
echo "Pasta contendo os ícones para o aplicativo (IconKitchen-Output) : $iconsPath"
echo "Cor de fundo do ícone do aplicativo                             : $backgroundColor"
echo

# Confirmação final antes de substituir os dados nos arquivos
read -p "Todos os dados estão corretos? [S/N]: " confirmacao_final
if [[ "$confirmacao_final" =~ ^[Ss]$ ]]; then
  # Função para substituir a palavra nos arquivos

  echo
  echo "Aguarde, configurando..."

  substituir_palavra() {
    local palavra=$1
    local valor=$2
    shift 2
    local arquivos=("$@")
    for arquivo in "${arquivos[@]}"; do
      if grep -q "$palavra" "$arquivo"; then
        sed -i '' "s/{{$palavra}}/$valor/g" "$arquivo"
      fi
    done
  }

  # Chama a função return_srgb para calcular os valores sRGB
  rgb_values=$(return_srgb "$backgroundColor")

  # Se a cor não for válida, interrompe o processo
  if [ $? -ne 0 ]; then
    echo "Cor de fundo do ícone do aplicativo é inválida"
    exit 1
  fi

  # Divide os valores RGB
  read -r red_srgb green_srgb blue_srgb <<< "$rgb_values"

  # Substitui os valores no arquivo LaunchScreen.storyboard
  storyboard_file="./ios/cardealer/LaunchScreen.storyboard"
  if [ -f "$storyboard_file" ]; then
    sed -i '' "s/{{RED}}/$red_srgb/g" "$storyboard_file"
    sed -i '' "s/{{GREEN}}/$green_srgb/g" "$storyboard_file"
    sed -i '' "s/{{BLUE}}/$blue_srgb/g" "$storyboard_file"
  fi

  # Substitui cada palavra pelo valor fornecido nos arquivos correspondentes
  substituir_palavra "ACCOUNT_ID" "$accountId" "${arquivos_account_id[@]}"
  substituir_palavra "ONESIGNAL_APP_ID" "$onesignalAppId" "${arquivos_onesignal_app_id[@]}"
  substituir_palavra "APP_NAME" "$appName" "${arquivos_app_name[@]}"
  substituir_palavra "APPLICATION_ID" "$applicationId" "${arquivos_application_id[@]}"
  substituir_palavra "BUNDLE_ID" "$bundleId" "${arquivos_bundle_id[@]}"
  substituir_palavra "ic_launcher_background" "$backgroundColor" "${arquivos_colors_background[@]}"

  # Copia os arquivos do Firebase
  cp "$firebaseAndroidPath" ./android/app/google-services.json
  cp "$firebaseIosPath" ./ios/GoogleService-Info.plist
  # Cria as pastas drawable e drawable-night, caso não existam
  mkdir -p ./android/app/src/main/res/drawable
  mkdir -p ./android/app/src/main/res/drawable-night
  
  # Copia os recursos para as pastas correspondentes
  rsync -av --exclude='mipmap-anydpi-v26' "$iconsPath/android/res/" ./android/app/src/main/res/
  cp "$iconsPath/android/res/mipmap-xxhdpi/ic_launcher_foreground.png" ./android/app/src/main/res/drawable/launch_screen.png
  cp "$iconsPath/android/res/mipmap-xxhdpi/ic_launcher_foreground.png" ./android/app/src/main/res/drawable-night/launch_screen.png
  cp -r "$iconsPath/ios/"* ./ios/cardealer/Images.xcassets/AppIcon.appiconset/
  # Caminho para o destino iOS
  iosIconSet="./ios/cardealer/Images.xcassets/Icon.imageset"
  # Cria a pasta Icon.imageset se não existir
  mkdir -p "$iosIconSet"
  # Copia e renomeia o AppIcon~ios-marketing.png para icon.png
  cp "$iconsPath/ios/AppIcon~ios-marketing.png" "$iosIconSet/icon.png"

  # Instala dependências do React Native
  yarn

  # Roda pod install
  cd ios || exit
  pod install

  echo
  yarn prints
  echo

  yarn build
  echo

  echo "Processo concluído com sucesso!"
  echo
  echo "Etapas para executar o projeto no Android e iOS"
  echo 
  echo "Android"
  echo "1. Acesse o terminal, depois acesse a pasta do projeto"
  echo "2. Em seguida digite o comando (yarn start) e aguarde iniciar"
  echo "3. Precione a letra (a) para iniciar a instalação no emulador do Android (a - run on Android)"
  echo "4. Aguarde finalizar o processo que o emulador será iniciado automaticamente"
  echo 
  echo "iOS"
  echo "1. Acesse o terminal, depois acesse a pasta do projeto"
  echo "2. Digite o comando (cd ios) e precione (enter)"
  echo "3. Digite o comando (open cardealer.xcworkspace) e precione enter novamente e aguarde o projeto ser aberto no Xcode"
  echo "4. Selecione o (device) (Ex: iPhone 16 Pro (18.0)) e em seguida clique em (play >)"
else
  echo
  echo "Configuração cancelada!"
fi
