DevSTART=$(date +%s);
clear;
env=$1
if [ "$env" != "qa" ]; then
    env="dev"
fi    
echo "Environment Selected: $env";    


cd ..;
root=${PWD};
npmDir=${APPDATA}/npm/
deployDir=/c/Transition
backupDir=/c/TransitionBackup

npm i yarn --g -silent;

echo $'\n'"----------- Installing PM2 -----------";
echo "This needs to be installed for each user."$'\n'$'\n';
$npmDir/yarn add pm2 --g --silent;                       

source $root/buildScripts/build.sh

echo $'\n'"----------- Stopping all running applications -----------"$'\n'$'\n';
$npmDir/pm2 kill


source $root/buildScripts/backup.sh

cd $root; source $root/buildScripts/deploy.sh $env

source $root/buildScripts/restartApps.sh

DevEND=$(date +%s);
echo $((DevEND-DevSTART)) | awk '{print "Total Duration to run: " int($1/60)":"int($1%60)}'