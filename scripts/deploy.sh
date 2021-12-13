rm -rf ../rbc/apps/longbox/
cp -r build/ longbox/
mv longbox ../rbc/apps/longbox
scp -r ../rbc/apps/longbox kittenb1@rootbeercomics.com:/home1/kittenb1/www/apps/
