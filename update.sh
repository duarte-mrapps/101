#!/bin/bash

set -e

# CONFIG
BACKUP_BRANCH="template-cardealer"
TEMPLATE_REPO="https://github.com/duarte-mrapps/template-teste.git"

log() {
  echo -e "\033[1;34m➔ $1\033[0m"
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

# Extrair app_name
APP_NAME_ANDROID=$(grep 'name="app_name"' android/app/src/main/res/values/strings.xml | sed -E 's/.*>(.*)<.*/\1/')
APP_NAME_IOS=$(grep INFOPLIST_KEY_CFBundleDisplayName "$PBXPROJ_PATH" | grep -v OneSignalNotificationServiceExtension | head -n 1 | cut -d '=' -f2 | cut -d ';' -f1 | sed 's/"//g' | xargs)
APP_NAME=$APP_NAME_IOS
[ -z "$APP_NAME" ] && APP_NAME=$APP_NAME_ANDROID
log "APP_NAME: $APP_NAME"

# Session vars
SESSION_FILE="src/libs/session.js"
ACCOUNT_ID=$(grep "ACCOUNT_ID" $SESSION_FILE | head -n 1 | sed -E "s/.*ACCOUNT_ID: '([^']+)'.*/\1/")
ONESIGNAL_APP_ID=$(grep "ONESIGNAL_APP_ID" $SESSION_FILE | head -n 1 | sed -E "s/.*ONESIGNAL_APP_ID: '([^']+)'.*/\1/")
log "ACCOUNT_ID: $ACCOUNT_ID"
log "ONESIGNAL_APP_ID: $ONESIGNAL_APP_ID"

# Storyboard colors
OLD_STORYBOARD=$(find ios -name "LaunchScreen.storyboard" | grep -v appdaloja | head -n 1)
RED=$(grep -o 'red="[^"]*"' "$OLD_STORYBOARD" | head -n1 | cut -d'"' -f2)
GREEN=$(grep -o 'green="[^"]*"' "$OLD_STORYBOARD" | head -n1 | cut -d'"' -f2)
BLUE=$(grep -o 'blue="[^"]*"' "$OLD_STORYBOARD" | head -n1 | cut -d'"' -f2)
log "RED: $RED"
log "GREEN: $GREEN"
log "BLUE: $BLUE"

# Backup dos assets
log "Backing up assets..."
TMP_BACKUP=$(mktemp -d)
mkdir -p $TMP_BACKUP/res
cp -R android/app/src/main/res/* $TMP_BACKUP/res/
mkdir -p $TMP_BACKUP/xcassets
cp -R ios/cardealer/Images.xcassets/* $TMP_BACKUP/xcassets/
cp ios/GoogleService-Info.plist $TMP_BACKUP/GoogleService-Info.plist || true
cp android/app/google-services.json $TMP_BACKUP/google-services.json || true
if [ -d prints ]; then
  mkdir -p $TMP_BACKUP/prints
  cp -R prints/* $TMP_BACKUP/prints/
  log "prints folder backed up"
fi

# Versões iOS
CARDEALER_PBXPROJ="ios/cardealer.xcodeproj/project.pbxproj"
APPDALOJA_PBXPROJ="ios/appdaloja.xcodeproj/project.pbxproj"
MARKETING_VERSION=$(grep -v OneSignalNotificationServiceExtension "$CARDEALER_PBXPROJ" | grep MARKETING_VERSION | head -n 1 | awk '{print $3}' | tr -d ';')
CURRENT_PROJECT_VERSION=$(grep -v OneSignalNotificationServiceExtension "$CARDEALER_PBXPROJ" | grep CURRENT_PROJECT_VERSION | head -n 1 | awk '{print $3}' | tr -d ';')
log "MARKETING_VERSION: $MARKETING_VERSION"
log "CURRENT_PROJECT_VERSION: $CURRENT_PROJECT_VERSION"

# Versões Android
CARDEALER_GRADLE="android/app/build.gradle"
APPDALOJA_GRADLE="android/app/build.gradle"
VERSION_CODE=$(grep versionCode $CARDEALER_GRADLE | head -n 1 | awk '{print $2}')
VERSION_NAME=$(grep versionName $CARDEALER_GRADLE | head -n 1 | cut -d '"' -f2)
log "VERSION_CODE: $VERSION_CODE"
log "VERSION_NAME: $VERSION_NAME"

# Limpa a main
log "Cleaning project on main branch..."
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} \;

# Clona o template
log "Cloning template repository..."
WORK_DIR=$(mktemp -d)
git clone $TEMPLATE_REPO $WORK_DIR
rm -rf $WORK_DIR/.git

# Substitui placeholders
cd $WORK_DIR
for placeholder in "APPLICATION_ID" "BUNDLE_ID" "ACCOUNT_ID" "ONESIGNAL_APP_ID" "APP_NAME" "RED" "GREEN" "BLUE"
do
  value=$(eval echo \$$placeholder)
  log "Replacing {{$placeholder}}..."
  grep -rl "{{${placeholder}}}" . | while read file; do
    sed -i.bak "s/{{${placeholder}}}/${value}/g" "$file" && rm "${file}.bak"
  done
done

# Atualiza versões no novo projeto
if [ -f "$APPDALOJA_PBXPROJ" ]; then
  sed -i.bak "s/MARKETING_VERSION = .*;/MARKETING_VERSION = $MARKETING_VERSION;/" "$APPDALOJA_PBXPROJ"
  sed -i.bak "s/CURRENT_PROJECT_VERSION = .*;/CURRENT_PROJECT_VERSION = $CURRENT_PROJECT_VERSION;/" "$APPDALOJA_PBXPROJ"
  rm "$APPDALOJA_PBXPROJ.bak"
fi

if [ -f "$APPDALOJA_GRADLE" ]; then
  sed -i.bak "s/versionCode .*/versionCode $VERSION_CODE/" "$APPDALOJA_GRADLE"
  sed -i.bak "s/versionName \".*\"/versionName \"$VERSION_NAME\"/" "$APPDALOJA_GRADLE"
  rm "$APPDALOJA_GRADLE.bak"
fi

# Restaura assets
log "Restoring assets into template..."
mkdir -p android/app/src/main/res
cp -R $TMP_BACKUP/res/* android/app/src/main/res/
mkdir -p ios/appdaloja/Images.xcassets
cp -R $TMP_BACKUP/xcassets/* ios/appdaloja/Images.xcassets/
cp $TMP_BACKUP/GoogleService-Info.plist ios/GoogleService-Info.plist || true
cp $TMP_BACKUP/google-services.json android/app/google-services.json || true
if [ -d $TMP_BACKUP/prints ]; then
  mkdir -p prints
  cp -R $TMP_BACKUP/prints/* prints/
  log "prints folder restored"
fi

cd -

# Copia pro projeto
log "Copying updated template to main branch..."
cp -a $WORK_DIR/. .

# Commit final
git add .
git commit -m "chore(template): update project using latest template version and preserve customer configuration"
git push origin main

log "✅ Template applied successfully!"
log "📦 Backup branch created: $BACKUP_BRANCH"
