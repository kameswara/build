START=$(date +%s);

if [ "$root" = "" ]; then
	cd ..;
    root=${PWD};
fi
echo $root;
npm cache clean
npm i -g yarn

echo $'\n'"----------- Installing yarn packages for Applications (Parallel) -----------"$'\n'$'\n';
(cd "$root/transitionAPI/"; yarn cleanall ) &
(cd "$root/Ingestion/";  yarn cleanall )    &
(cd "$root/SendRequest/";  yarn cleanall )  &
(cd "$root/DialerResults/"; yarn cleanall ) &
(cd "$root/FinalizeDialerActivityProcessor/"; yarn cleanall ) &
wait


END=$(date +%s);
echo $((END-START)) | awk '{print "Total Duration to run: " int($1/60)":"int($1%60)}'