#!/bin/bash

# Verificar se o argumento foi passado
if [ -z "$1" ]; then
  echo "Erro: é necessário passar o nome da pasta como argumento (iphone, ipad, android, tablet)"
  exit 1
fi

# Mapear os nomes das pastas
case "$1" in
  iphone)
    target_folder="ios iphones"
    ;;
  ipad)
    target_folder="ios ipad"
    ;;
  android)
    target_folder="google pixel 7 pro"
    ;;
  tablet)
    target_folder="samsung galaxy tab s8 ultra"
    ;;
  *)
    echo "Erro: argumento inválido. Use iphone, ipad, android ou tablet."
    exit 1
    ;;
esac

# Verificar se a pasta especificada existe, se não, criar
if [ ! -d "prints/$target_folder" ]; then
  echo "A pasta 'prints/$target_folder' não existe. Criando..."
  mkdir -p "prints/$target_folder"
fi

# Mover imagens para a pasta especificada
echo "Movendo imagens para prints/$target_folder..."
find "prints/$target_folder/" -type f -name "*.png" -exec mv {} "prints/$target_folder/" \;

# Deletar as subpastas dentro da pasta especificada
echo "Deletando subpastas dentro de prints/$target_folder..."
find "prints/$target_folder/" -type d -not -path "prints/$target_folder" -delete

echo "Processamento concluído para prints/$target_folder."
