#!/bin/bash

set -e

# CONFIG
BACKUP_BRANCH="template-cardealer"
TEMPLATE_REPO="https://github.com/duarte-mrapps/template-teste.git"

log() {
  echo -e "${BLUE}➔ $1${NC}"
}

# Valida se é um repositório Git
log "Validating Git repository..."
if [ ! -d .git ]; then
  log "This directory is not a Git repository!"
  exit 1
fi

# Garante que estamos na main
git checkout main
git pull origin main

# Verifica se existem alterações não commitadas na main
if ! git diff-index --quiet HEAD --; then
  log "There are uncommitted changes on main. Please commit or stash them before running this script."
  exit 1
fi

# Deleta branch de backup se já existir (local e remoto)
if git show-ref --verify --quiet refs/heads/$BACKUP_BRANCH; then
  log "Local branch $BACKUP_BRANCH exists. Deleting..."
  git branch -D $BACKUP_BRANCH
fi

if git ls-remote --exit-code --heads origin $BACKUP_BRANCH &> /dev/null; then
  log "Remote branch $BACKUP_BRANCH exists. Deleting..."
  git push origin --delete $BACKUP_BRANCH
fi

# Cria branch de backup
log "Creating backup branch $BACKUP_BRANCH..."
git checkout -b $BACKUP_BRANCH
git push -u origin $BACKUP_BRANCH
git checkout main

# Extrai as variáveis
log "Extracting variables..."

APPLICATION_ID=$(grep applicationId android/app/build.gradle | head -n 1 | cut -d '"' -f2)
log "applicationId: $APPLICATION_ID"

IOS_PROJECT_PATH=$(find ios -name "*.xcodeproj" | head -n 1)
PBXPROJ_PATH="$IOS_PROJECT_PATH/project.pbxproj"

BUNDLE_ID=$(grep "PRODUCT_BUNDLE_IDENTIFIER" $PBXPROJ_PATH \
    | awk -F'= ' '{print $2}' \
    | tr -d ' ;' \
    | grep '^com\..*\.ios$' \
    | head -n 1)

if [ -z "$BUNDLE_ID" ]; then
  log "Could not find valid bundleId in format com.<client>.ios"
  exit 1
fi
log "bundleId: $BUNDLE_ID"

# Extrair app_name do Android
APP_NAME_ANDROID=$(grep 'name="app_name"' android/app/src/main/res/values/strings.xml | sed -E 's/.*>(.*)<.*/\1/')

# Extrair display name do iOS (ignorando extensão do OneSignal)
APP_NAME_IOS=$(grep INFOPLIST_KEY_CFBundleDisplayName "$PBXPROJ_PATH" \
  | grep -v OneSignalNotificationServiceExtension \
  | head -n 1 \
  | cut -d '=' -f2 \
  | cut -d ';' -f1 \
  | sed 's/"//g' \
  | xargs)

# Usar o nome do iOS como padrão se disponível
APP_NAME=$APP_NAME_IOS
if [ -z "$APP_NAME" ]; then
  APP_NAME=$APP_NAME_ANDROID
fi

log "APP_NAME: $APP_NAME"

SESSION_FILE="src/libs/session.js"
ACCOUNT_ID=$(grep "ACCOUNT_ID" $SESSION_FILE | head -n 1 | sed -E "s/.*ACCOUNT_ID: '([^']+)'.*/\1/")
ONESIGNAL_APP_ID=$(grep "ONESIGNAL_APP_ID" $SESSION_FILE | head -n 1 | sed -E "s/.*ONESIGNAL_APP_ID: '([^']+)'.*/\1/")

log "ACCOUNT_ID: $ACCOUNT_ID"
log "ONESIGNAL_APP_ID: $ONESIGNAL_APP_ID"

# Faz backup dos assets
log "Backing up assets..."
TMP_BACKUP=$(mktemp -d)

mkdir -p $TMP_BACKUP/res
cp -R android/app/src/main/res/* $TMP_BACKUP/res/

mkdir -p $TMP_BACKUP/xcassets
cp -R ios/cardealer/Images.xcassets/* $TMP_BACKUP/xcassets/

cp ios/GoogleService-Info.plist $TMP_BACKUP/GoogleService-Info.plist || true
cp android/app/google-services.json $TMP_BACKUP/google-services.json || true

# Backup da pasta prints
if [ -d prints ]; then
  mkdir -p $TMP_BACKUP/prints
  cp -R prints/* $TMP_BACKUP/prints/
  log "prints folder backed up"
else
  log "prints folder not found, skipping backup"
fi

# Limpa o projeto na main
log "Cleaning project on main branch..."
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} \;

# Clona o template isoladamente
log "Cloning template repository..."
WORK_DIR=$(mktemp -d)
git clone $TEMPLATE_REPO $WORK_DIR

# Remove o .git do template para não sobrescrever o repositório
rm -rf $WORK_DIR/.git

# Substitui placeholders
cd $WORK_DIR
for placeholder in "APPLICATION_ID" "BUNDLE_ID" "ACCOUNT_ID" "ONESIGNAL_APP_ID" "APP_NAME"
do
  value=$(eval echo \$$placeholder)
  log "Replacing {{$placeholder}}..."
  grep -rl "{{${placeholder}}}" . | while read file; do
    sed -i.bak "s/{{${placeholder}}}/${value}/g" "$file" && rm "${file}.bak"
  done
done

# Restaura os assets no template
log "Restoring assets into template..."

mkdir -p android/app/src/main/res
cp -R $TMP_BACKUP/res/* android/app/src/main/res/

mkdir -p ios/appdaloja/Images.xcassets
cp -R $TMP_BACKUP/xcassets/* ios/appdaloja/Images.xcassets/

cp $TMP_BACKUP/GoogleService-Info.plist ios/GoogleService-Info.plist || true
cp $TMP_BACKUP/google-services.json android/app/google-services.json || true

# Restaura a pasta prints
if [ -d $TMP_BACKUP/prints ]; then
  mkdir -p prints
  cp -R $TMP_BACKUP/prints/* prints/
  log "prints folder restored"
fi

cd -

# Copia tudo (inclusive arquivos ocultos) pro repositório principal
log "Copying updated template to main branch..."
cp -a $WORK_DIR/. .

# Commit final
git add .
git commit -m "chore(template): update project using latest template version and preserve customer configuration"
git push origin main

log "Template applied successfully! Main branch is now updated."
log "Backup of previous version is stored in branch $BACKUP_BRANCH."