clear;
cd ..;
root=${PWD};
npmDir=${APPDATA}/npm/
deployDir=/c/Transition
backupDir=/c/TransitionBackup

echo $'\n'"----------- Cleaning up the files -----------";
cd $root;
git reset --hard HEAD;
git pull;
git clean -dfx;

echo $'\n'"----------- Installing PM2 -----------";
echo "This needs to be installed for each user."$'\n'$'\n';
npm i pm2 --g --silent                       

source $root/buildScripts/buildApps.sh

echo $'\n'"----------- Stopping all running applications -----------"$'\n'$'\n';
$npmDir/pm2 kill

source $root/buildScripts/backup.sh

#Move the required code from git/build folder to the App folder
echo $'\n'"----------- Clearing deployment folder -----------";
echo "Deployment Folder: $deployDir"$'\n'$'\n';
rm -r $deployDir

echo $'\n'"----------- Copying Files for transitionAPI -----------";
echo "Build Folder: $root/transitionAPI";
echo "Deployment Folder: $deployDir/transitionAPI"$'\n'$'\n';
mkdir -p $deployDir/transitionAPI; cp -R $root/transitionAPI/package.json $_
mkdir -p $deployDir/transitionAPI/dist; cp -R $root/transitionAPI/dist/* $_
mkdir -p $deployDir/transitionAPI/node_modules; cp -R $root/transitionAPI/node_modules/* $_
cp $deployDir/transitionAPI/dist/src/envConfigs/devConfig.js $deployDir/transitionAPI/dist/src/config.js

echo $'\n'"----------- Copying Files for Ingestion -----------";
echo "Build Folder: $root/Ingestion";
echo "Deployment Folder: $deployDir/Ingestion"$'\n'$'\n';
mkdir -p $deployDir/Ingestion; cp -R $root/Ingestion/package.json $_
mkdir -p $deployDir/Ingestion/dist; cp -R $root/Ingestion/dist/* $_
mkdir -p $deployDir/Ingestion/node_modules; cp -R $root/Ingestion/node_modules/* $_
cp $deployDir/Ingestion/dist/src/envConfigs/devConfig.js $deployDir/Ingestion/dist/src/Config.js

echo $'\n'"----------- Copying Files for SendRequest -----------";
echo "Build Folder: $root/SendRequest";
echo "Deployment Folder: $deployDir/SendRequest"$'\n'$'\n';
mkdir -p $deployDir/SendRequest; cp -R $root/SendRequest/package.json $_
mkdir -p $deployDir/SendRequest/dist; cp -R $root/SendRequest/dist/* $_
mkdir -p $deployDir/SendRequest/node_modules; cp -R $root/SendRequest/node_modules/* $_
cp $deployDir/SendRequest/dist/src/envConfigs/devConfig.js $deployDir/SendRequest/dist/src/Config.js

echo $'\n'"----------- Copying Files for DialerResults -----------";
echo "Build Folder: $root/DialerResults";
echo "Deployment Folder: $deployDir/DialerResults"$'\n'$'\n';
mkdir -p $deployDir/DialerResults; cp -R $root/DialerResults/package.json $_
mkdir -p $deployDir/DialerResults/dist; cp -R $root/DialerResults/dist/* $_
mkdir -p $deployDir/DialerResults/node_modules; cp -R $root/DialerResults/node_modules/* $_
cp $deployDir/DialerResults/dist/src/envConfigs/devConfig.js $deployDir/DialerResults/dist/src/config.js

echo $'\n'"----------- Copying Files for FinalizeDialerActivityProcessor -----------";
echo "Build Folder: $root/FinalizeDialerActivityProcessor";
echo "Deployment Folder: $deployDir/FinalizeDialerActivityProcessor"$'\n'$'\n';
mkdir -p $deployDir/FinalizeDialerActivityProcessor; cp -R $root/FinalizeDialerActivityProcessor/package.json $_
mkdir -p $deployDir/FinalizeDialerActivityProcessor/dist; cp -R $root/FinalizeDialerActivityProcessor/dist/* $_
mkdir -p $deployDir/FinalizeDialerActivityProcessor/node_modules; cp -R $root/FinalizeDialerActivityProcessor/node_modules/* $_
cp $deployDir/FinalizeDialerActivityProcessor/dist/src/envConfigs/devConfig.js $deployDir/FinalizeDialerActivityProcessor/dist/src/Config.js

source $root/buildScripts/restartApps.sh