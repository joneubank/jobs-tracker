up:
	docker-compose up -d

down:
	docker-compose down --remove-orphans

nuke:
	docker-compose down --volumes --remove-orphans