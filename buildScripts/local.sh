clear;
cd ..; 
root=${PWD};

echo $'\n'"----------- Cleaning up the files -----------";
echo "This will only clean files & Directories that are in the .gitignore file"$'\n'$'\n';
git clean -dfX

echo $'\n'"----------- Clearing the NPM cache -----------";
echo "This might fail if you are not running this as admin. This failing won't hurt anything."$'\n'$'\n';
npm cache clear

echo $'\n'"----------- Installing npm packages for custom modules (Parallel) -----------"$'\n'$'\n';
(cd "$root/modules/TransistionDAL/"; npm install;) &
(cd "$root/modules/WatsonHealthUtils/"; npm install;) &
wait

echo $'\n'"----------- Building TransistionDAL -----------"$'\n'$'\n';
cd "$root/modules/TransistionDAL/";
npm run installtypings
npm run build

echo $'\n'"----------- Building WatsonHealthUtils -----------"$'\n'$'\n';
cd "$root/modules/WatsonHealthUtils/";
npm run installtypings
npm run build

echo $'\n'"----------- Installing npm packages for Applications (Parallel) -----------"$'\n'$'\n';
(cd "$root/transitionAPI/"; npm uninstall watsonhealthutils transistiondal; npm install;) &
(cd "$root/Ingestion/"; npm uninstall watsonhealthutils transistiondal; npm install;) &
(cd "$root/SendRequest/"; npm uninstall watsonhealthutils transistiondal; npm install;) &
(cd "$root/DialerResults/"; npm uninstall watsonhealthutils transistiondal; npm install;) &
(cd "$root/FinalizeDialerActivityProcessor/"; npm uninstall watsonhealthutils transistiondal; npm install;) &
wait

echo $'\n'"----------- Building transitionAPI -----------"$'\n'$'\n';
cd "$root/transitionAPI/";
npm run build;

echo $'\n'"----------- Building Ingestion -----------"$'\n'$'\n';
cd "$root/Ingestion/";
npm run build;

echo $'\n'"----------- Building SendRequest -----------"$'\n'$'\n';
cd "$root/SendRequest/";
npm run build;

echo $'\n'"----------- Building DialerResults -----------"$'\n'$'\n';
cd "$root/DialerResults/";
npm run build;

echo $'\n'"----------- Building FinalizeDialerActivityProcessor -----------"$'\n'$'\n';
cd "$root/FinalizeDialerActivityProcessor/";
npm run build;

echo $'\n'"----------- Running Unit tests on projects -----------"$'\n'$'\n';
echo $'\n'"----- transitionAPI -----"$'\n'$'\n'; cd "$root/transitionAPI/"; npm run coverage;
echo $'\n'"----- Ingestion -----"$'\n'$'\n'; cd "$root/Ingestion/"; npm test;
echo $'\n'"----- SendRequest -----"$'\n'$'\n'; cd "$root/SendRequest/"; npm test;
echo $'\n'"----- DialerResults -----"$'\n'$'\n'; cd "$root/DialerResults/"; npm test;
echo $'\n'"----- FinalizeDialerActivityProcessor -----"$'\n'$'\n'; cd "$root/FinalizeDialerActivityProcessor/"; npm run coverage;

echo $'\n'"----------- Running tslint on projects -----------"$'\n'$'\n';
echo $'\n'"----- TransistionDAL -----"$'\n'$'\n'; cd "$root/modules/TransistionDAL/"; npm run tslint
echo $'\n'"----- WatsonHealthUtils -----"$'\n'$'\n'; cd "$root/modules/WatsonHealthUtils/"; npm run tslint
echo $'\n'"----- transitionAPI -----"$'\n'$'\n'; cd "$root/transitionAPI/"; npm run tslint
echo $'\n'"----- Ingestion -----"$'\n'$'\n'; cd "$root/Ingestion/"; npm run tslint
echo $'\n'"----- SendRequest -----"$'\n'$'\n'; cd "$root/SendRequest/"; npm run tslint
echo $'\n'"----- DialerResults -----"$'\n'$'\n'; cd "$root/DialerResults/"; npm run tslint
echo $'\n'"----- FinalizeDialerActivityProcessor -----"$'\n'$'\n'; cd "$root/FinalizeDialerActivityProcessor/"; npm run tslint