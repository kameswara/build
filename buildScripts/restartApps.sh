if [ "$npmDir" = "" ]; then
	npmDir=${APPDATA}/npm/
fi
if [ "$deployDir" = "" ]; then
	deployDir=/c/Transition
fi

echo $'\n'"----------- Stopping all running applications -----------"$'\n'$'\n';
$npmDir/pm2 kill

echo $'\n'"----------- Starting transitionAPI -----------"$'\n'$'\n';
cd $deployDir/transitionAPI;
PM2_HOME="$deployDir/.pm2" $npmDir/pm2 start ./dist/src/transitionapi.js --name "TransitionAPI-App";

echo $'\n'"----------- Starting Ingestion -----------"$'\n'$'\n';
cd $deployDir/Ingestion;
PM2_HOME="$deployDir/.pm2" $npmDir/pm2 start ./dist/src/ingestion.js --name "Ingestion-App";

echo $'\n'"----------- Starting SendRequest -----------"$'\n'$'\n';
cd $deployDir/SendRequest;
PM2_HOME="$deployDir/.pm2" $npmDir/pm2 start ./dist/src/server.js --name "SendRequest-App";

echo $'\n'"----------- Starting DialerResults -----------"$'\n'$'\n';
cd $deployDir/DialerResults;
PM2_HOME="$deployDir/.pm2" $npmDir/pm2 start ./dist/src/app.js --name "DialerResults-App";

echo $'\n'"----------- Starting FinalizeDialerActivityProcessor -----------"$'\n'$'\n';
cd $deployDir/FinalizeDialerActivityProcessor;
PM2_HOME="$deployDir/.pm2" $npmDir/pm2 start ./dist/src/ProcessResultApp.js --name "FinalizeDialer-App";

echo $'\n'"----------- Application Status -----------"$'\n'$'\n';
$npmDir/pm2 list

echo $'\n'"----------- Script Complete -----------";