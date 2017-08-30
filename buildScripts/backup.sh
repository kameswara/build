if [ "$deployDir" = "" ]; then
	deployDir=/c/Transition
fi
if [ "$backupDir" = "" ]; then
	backupDir=/c/TransitionBackup
fi

echo $'\n'"----------- Clearing out previous backup -----------";
echo "Backup Folder: $backupDir"$'\n'$'\n';
rm -r $backupDir

echo $'\n'"----------- Backing up all applications -----------";
echo "Folder being backed up: $deployDir";
echo "Backup Folder: $backupDir"$'\n'$'\n';
mkdir -p $backupDir; cp -R $deployDir/* $_