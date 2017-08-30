START=$(date +%s);

if [ "$root" = "" ]; then
	cd ..;
    root=${PWD};
fi

echo $'\n'"----------- Installing npm packages for custom modules (Parallel) -----------"$'\n'$'\n';
(cd $root/modules/TransistionDAL/; npm install --production;) &
(cd $root/modules/WatsonHealthUtils/; npm install --production;) &
wait

echo $'\n'"----------- Building TransistionDAL -----------"$'\n'$'\n';
cd $root/modules/TransistionDAL/;
npm run installtypings --silent;
npm run build;

echo $'\n'"----------- Building WatsonHealthUtils -----------"$'\n'$'\n';
cd $root/modules/WatsonHealthUtils/;
npm run installtypings --silent;
npm run build;

echo $'\n'"----------- Installing npm packages for Applications (Parallel) -----------"$'\n'$'\n';
(cd "$root/transitionAPI/"; npm uninstall watsonhealthutils transistiondal; npm install --production;) &
(cd "$root/Ingestion/"; npm uninstall watsonhealthutils transistiondal; npm install --production;) &
(cd "$root/SendRequest/"; npm uninstall watsonhealthutils transistiondal; npm install --production;) &
(cd "$root/DialerResults/"; npm uninstall watsonhealthutils transistiondal; npm install --production;) &
(cd "$root/FinalizeDialerActivityProcessor/"; npm uninstall watsonhealthutils transistiondal; npm install --production;) &
wait

echo $'\n'"----------- Building transitionAPI -----------"$'\n'$'\n';
cd "$root/transitionAPI/"
npm run buildProd;

echo $'\n'"----------- Building Ingestion -----------"$'\n'$'\n';
cd "$root/Ingestion/"
npm run buildProd;

echo $'\n'"----------- Building SendRequest -----------"$'\n'$'\n';
cd "$root/SendRequest/"
npm run buildProd;

echo $'\n'"----------- Building DialerResults -----------"$'\n'$'\n';
cd "$root/DialerResults/"
npm run buildProd;

echo $'\n'"----------- Building FinalizeDialerActivityProcessor -----------"$'\n'$'\n';
cd "$root/FinalizeDialerActivityProcessor/"
npm run buildProd;

echo $'\n'"----------- Building Complete -----------"$'\n'$'\n';
END=$(date +%s);
echo $((END-START)) | awk '{print "Total Duration to run: " int($1/60)":"int($1%60)}'