START=$(date +%s);

if [ "$root" = "" ]; then
	cd ..;
    root=${PWD};
fi
npmDir=${APPDATA}/npm/

echo $'\n'"----------- Installing yarn packages for custom modules (Parallel) -----------"$'\n'$'\n';
(cd $root/modules/TransistionDAL/; $npmDir/yarn install;) &
(cd $root/modules/WatsonHealthUtils/; $npmDir/yarn install;) & wait

echo $'\n'"----------- Building TransistionDAL -----------"$'\n'$'\n';
cd $root/modules/TransistionDAL/;
$npmDir/yarn installtypings; 
$npmDir/yarn build;

echo $'\n'"----------- Building WatsonHealthUtils -----------"$'\n'$'\n';
cd $root/modules/WatsonHealthUtils/;
$npmDir/yarn installtypings;
$npmDir/yarn build;

#yarn remove watsonhealthutils transistiondal;
echo $'\n'"----------- Installing yarn packages for Applications (Parallel) -----------"$'\n'$'\n';
(cd "$root/transitionAPI/"; $npmDir/yarn install;) &&
(cd "$root/Ingestion/";  $npmDir/yarn install;) &&
(cd "$root/SendRequest/";  $npmDir/yarn install;) &&
(cd "$root/DialerResults/"; $npmDir/yarn install;) &&
(cd "$root/FinalizeDialerActivityProcessor/"; $npmDir/yarn install;) &
wait

echo $'\n'"----------- Building transitionAPI -----------"$'\n'$'\n';
cd "$root/transitionAPI/"
$npmDir/yarn buildProd;

echo $'\n'"----------- Building Ingestion -----------"$'\n'$'\n';
cd "$root/Ingestion/"
$npmDir/yarn buildProd;

echo $'\n'"----------- Building SendRequest -----------"$'\n'$'\n';
cd "$root/SendRequest/"
$npmDir/yarn buildProd;

echo $'\n'"----------- Building DialerResults -----------"$'\n'$'\n';
cd "$root/DialerResults/"
$npmDir/yarn buildProd;

echo $'\n'"----------- Building FinalizeDialerActivityProcessor -----------"$'\n'$'\n';
cd "$root/FinalizeDialerActivityProcessor/"
$npmDir/yarn buildProd;

echo $'\n'"----------- Building Complete -----------"$'\n'$'\n';


END=$(date +%s);
echo $((END-START)) | awk '{print "Total Duration to run: " int($1/60)":"int($1%60)}'