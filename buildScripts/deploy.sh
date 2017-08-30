root=${PWD};

env=$1
if [ "$env" != "qa" ] && [ "$env" != "prod" ]; then
    env="dev"
fi    
echo "Environment Selected: $env";    

deployDir=/c/Transition
backupDir=/c/TransitionBackup

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


echo $'\n'"----------- Copying Files for Ingestion -----------";
echo "Build Folder: $root/Ingestion";
echo "Deployment Folder: $deployDir/Ingestion"$'\n'$'\n';
mkdir -p $deployDir/Ingestion; cp -R $root/Ingestion/package.json $_
mkdir -p $deployDir/Ingestion/dist; cp -R $root/Ingestion/dist/* $_
mkdir -p $deployDir/Ingestion/node_modules; cp -R $root/Ingestion/node_modules/* $_

echo $'\n'"----------- Copying Files for SendRequest -----------";
echo "Build Folder: $root/SendRequest";
echo "Deployment Folder: $deployDir/SendRequest"$'\n'$'\n';
mkdir -p $deployDir/SendRequest; cp -R $root/SendRequest/package.json $_
mkdir -p $deployDir/SendRequest/dist; cp -R $root/SendRequest/dist/* $_
mkdir -p $deployDir/SendRequest/node_modules; cp -R $root/SendRequest/node_modules/* $_

echo $'\n'"----------- Copying Files for DialerResults -----------";
echo "Build Folder: $root/DialerResults";
echo "Deployment Folder: $deployDir/DialerResults"$'\n'$'\n';
mkdir -p $deployDir/DialerResults; cp -R $root/DialerResults/package.json $_
mkdir -p $deployDir/DialerResults/dist; cp -R $root/DialerResults/dist/* $_
mkdir -p $deployDir/DialerResults/node_modules; cp -R $root/DialerResults/node_modules/* $_


echo $'\n'"----------- Copying Files for FinalizeDialerActivityProcessor -----------";
echo "Build Folder: $root/FinalizeDialerActivityProcessor";
echo "Deployment Folder: $deployDir/FinalizeDialerActivityProcessor"$'\n'$'\n';
mkdir -p $deployDir/FinalizeDialerActivityProcessor; cp -R $root/FinalizeDialerActivityProcessor/package.json $_
mkdir -p $deployDir/FinalizeDialerActivityProcessor/dist; cp -R $root/FinalizeDialerActivityProcessor/dist/* $_
mkdir -p $deployDir/FinalizeDialerActivityProcessor/node_modules; cp -R $root/FinalizeDialerActivityProcessor/node_modules/* $_

if [ "$env" = "qa" ]; then
    echo $'\n'"-----------Deploy QA environment";
    cp $deployDir/transitionAPI/dist/src/envConfigs/qaConfig.js $deployDir/transitionAPI/dist/src/config.js
    cp $deployDir/Ingestion/dist/src/envConfigs/qaConfig.js $deployDir/Ingestion/dist/src/Config.js
    cp $deployDir/SendRequest/dist/src/envConfigs/qaConfig.js $deployDir/SendRequest/dist/src/Config.js
    cp $deployDir/SendRequest/dist/src/envConfigs/qa.slingshotConfig.js $deployDir/SendRequest/dist/src/slingshotConfig.js
    cp $deployDir/DialerResults/dist/src/envConfigs/qaConfig.js $deployDir/DialerResults/dist/src/config.js
    cp $deployDir/FinalizeDialerActivityProcessor/dist/src/envConfigs/qaConfig.js $deployDir/FinalizeDialerActivityProcessor/dist/src/Config.js

elif [ "$env" = "prod" ]
    echo $'\n'"-----------Deploy prod environment";
    cp $deployDir/transitionAPI/dist/src/envConfigs/prodConfig.js $deployDir/transitionAPI/dist/src/config.js
    cp $deployDir/Ingestion/dist/src/envConfigs/prodConfig.js $deployDir/Ingestion/dist/src/Config.js
    cp $deployDir/SendRequest/dist/src/envConfigs/prodConfig.js $deployDir/SendRequest/dist/src/Config.js
    cp $deployDir/SendRequest/dist/src/envConfigs/prod.slingshotConfig.js $deployDir/SendRequest/dist/src/slingshotConfig.js
    cp $deployDir/DialerResults/dist/src/envConfigs/prodConfig.js $deployDir/DialerResults/dist/src/config.js
    cp $deployDir/FinalizeDialerActivityProcessor/dist/src/envConfigs/prodConfig.js $deployDir/FinalizeDialerActivityProcessor/dist/src/Config.js

else
    echo $'\n'"-----------Deploy Dev environment";
    cp $deployDir/transitionAPI/dist/src/envConfigs/devConfig.js $deployDir/transitionAPI/dist/src/config.js
    cp $deployDir/Ingestion/dist/src/envConfigs/devConfig.js $deployDir/Ingestion/dist/src/Config.js
    cp $deployDir/SendRequest/dist/src/envConfigs/devConfig.js $deployDir/SendRequest/dist/src/Config.js
    cp $deployDir/DialerResults/dist/src/envConfigs/devConfig.js $deployDir/DialerResults/dist/src/config.js
    cp $deployDir/FinalizeDialerActivityProcessor/dist/src/envConfigs/devConfig.js $deployDir/FinalizeDialerActivityProcessor/dist/src/Config.js



fi
