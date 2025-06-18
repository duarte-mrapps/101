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
  "./ios/appdaloja/Info.plist"
  "./ios/appdaloja.xcodeproj/project.pbxproj"
)
arquivos_application_id=(
  "./README.md"
  "./android/app/build.gradle"
)
arquivos_bundle_id=(
  "./README.md"
  "./ios/appdaloja/appdaloja.entitlements"
  "./ios/appdaloja.xcodeproj/project.pbxproj"
  "./ios/OneSignalNotificationServiceExtension/OneSignalNotificationServiceExtension.entitlements"
)
arquivos_colors_background=(
  "./android/app/src/main/res/values/ic_launcher_background.xml"
)

# Caminho da imagem do ícone do Android gerado no Android Studio
android_icon_path="$HOME/AndroidStudioProjects/MyApplication/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png"
android_build_path="./android/app/build/outputs/bundle/release/"

android_project="$HOME/AndroidStudioProjects/MyApplication"

# Define o caminho base para recursos
res_path="$HOME/AndroidStudioProjects/MyApplication/app/src/main/res"

# Função para verificar se os arquivos existem (nos caminhos fixos)
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

# Verifica se os arquivos fixos existem
verificar_arquivos arquivos_colors_background[@]

# Função para solicitar e validar entrada do usuário
solicitar_valor() {
  local prompt=$1
  local androidIcons=$2
  local valor=""
  while true; do
    read -r -p "$prompt: " valor
    valor=$(echo "$valor" | xargs)
    if [[ -z "$valor" ]]; then
      echo "Este campo é obrigatório. Por favor, insira um valor."
    elif [[ "$androidIcons" == "true" ]]; then
      if [[ "$valor" =~ ^[Ss]$ ]]; then
        open "$android_icon_path"
        break
      fi
      open -a "Android Studio" "$android_project"
    else
      break
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

echo "Você criou os ícones para Android no Android Studio?"
androidIconsExists=$(solicitar_valor "Confirmar? [S/N]" true)
echo

# Solicita a pasta raiz que contém os arquivos do Firebase e a pasta de ícones
echo "Arraste e solte a pasta de ícones (IconKitchen-Output):"
iconsPath=$(solicitar_valor "Arraste e solte a pasta aqui")
echo

# Extrai os caminhos dos arquivos e da pasta a partir da pasta root informada

# Verifica se os arquivos e a pasta existem dentro da pasta root
if [ ! -d "$iconsPath" ]; then
  echo "Pasta contendo os ícones (IconKitchen-Output) não encontrada em: $iconsPath"
  exit 1
fi


echo "Pasta contendo os ícones para o aplicativo (IconKitchen-Output): $iconsPath"
echo

# Obtém a cor de fundo diretamente do arquivo XML
backgroundColor=$(sed -n 's/.*<color name="ic_launcher_background">\([^<]*\)<\/color>.*/\1/p' "$res_path/values/ic_launcher_background.xml" | tr 'a-f' 'A-F')
echo "Cor de fundo do ícone do aplicativo: $backgroundColor"
echo

# Exibe um resumo dos dados informados
echo "Resumo"
echo "Confira atentamente todos os dados informados"
echo
echo "Pasta contendo os ícones para o aplicativo (IconKitchen-Output)   : $iconsPath"
echo "Cor de fundo do ícone do aplicativo                               : $backgroundColor"
echo

# Confirmação final antes de substituir os dados nos arquivos
read -p "Todos os dados estão corretos? [S/N]: " confirmacao_final
if [[ "$confirmacao_final" =~ ^[Ss]$ ]]; then
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
  read -r red_srgb green_srgb blue_srgb <<<"$rgb_values"

  # Substitui os valores no arquivo LaunchScreen.storyboard
  storyboard_file="./ios/appdaloja/LaunchScreen.storyboard"
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

  # Copia os arquivos do Firebase e os recursos para o projeto
  cp "$res_path/values/ic_launcher_background.xml" ./android/app/src/main/res/values/ic_launcher_background.xml

  mkdir -p ./android/app/src/main/res/drawable
  mkdir -p ./android/app/src/main/res/drawable-night

  for folder in mipmap-anydpi-v26 mipmap-hdpi mipmap-mdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi; do
    if [ -d "$res_path/$folder" ]; then
      cp -r "$res_path/$folder" ./android/app/src/main/res/
    else
      echo "Aviso: A pasta $folder não foi encontrada em $res_path"
    fi
  done

  cp "$iconsPath/android/res/mipmap-xxhdpi/ic_launcher_foreground.png" ./android/app/src/main/res/drawable/launch_screen.png
  cp "$iconsPath/android/res/mipmap-xxhdpi/ic_launcher_foreground.png" ./android/app/src/main/res/drawable-night/launch_screen.png
  cp -r "$iconsPath/ios/"* ./ios/appdaloja/Images.xcassets/AppIcon.appiconset/
  
  iosIconSet="./ios/appdaloja/Images.xcassets/Icon.imageset"
  mkdir -p "$iosIconSet"
  cp "$iconsPath/ios/AppIcon~ios-marketing.png" "$iosIconSet/icon.png"
  
  # Instala dependências do React Native e realiza o build
  yarn
  echo
  cd ios || exit
  pod install

  open appdaloja.xcworkspace

  cd ..

  echo
  yarn build
  echo
  
  open "$android_build_path"
  echo
  
  echo "Processo concluído com sucesso!"
  echo
  echo "Etapas para executar o projeto no Android e iOS"
  echo
  echo "Android"
  echo "1. Acesse o terminal, depois acesse a pasta do projeto"
  echo "2. Em seguida, digite o comando (yarn start) e aguarde iniciar"
  echo "3. Pressione a letra (a) para iniciar a instalação no emulador do Android"
  echo "4. Aguarde finalizar o processo que o emulador será iniciado automaticamente"
  echo
  echo "iOS"
  echo "1. Acesse o terminal, depois acesse a pasta do projeto"
  echo "2. Digite o comando (cd ios) e pressione (enter)"
  echo "3. Digite o comando (open appdaloja.xcworkspace) e pressione enter novamente, aguardando o projeto ser aberto no Xcode"
  echo "4. Selecione o (device) desejado (Ex: iPhone 16 Pro (18.0)) e clique em (play >)"
else
  echo
  echo "Configuração cancelada!"
fi
