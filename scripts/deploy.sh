rm -rf ../rbc/projects/longbox/
cp -r build/ longbox/
mv longbox ../rbc/projects/longbox
scp -r ../rbc/projects/longbox kittenb1@rootbeercomics.com:/home1/kittenb1/www/projects/
