rm -rf ../rootbeercomics/apps/longbox/
cp -r build/ longbox/
mv longbox ../rootbeercomics/apps/longbox/
scp -r ../rootbeercomics/apps/longbox kittenb1@rootbeercomics.com:/home1/kittenb1/www/apps/
