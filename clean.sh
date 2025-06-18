#!/bin/bash

echo "Executando..."
echo

# Remover pasta node_modules
echo "Removendo pasta node_modules..."
rm -rf node_modules

# Remover pasta Pods dentro de ios/
echo "Removendo pasta Pods dentro de ios/..."
rm -rf ios/Pods

# Remover pasta build dentro de android/app/
echo "Removendo pasta build dentro de android/app/..."
rm -rf android/app/build

echo
echo "Processo concluído com sucesso!"
