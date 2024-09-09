YAML_FILE=docker-compose.yml
ENV_FILE=.env
CERT_FILE=.private.crt
KEY_FILE=.private.key

.PHONY: all re clean fclean stop start

all: $(YAML_FILE) $(ENV_FILE) $(CERT_FILE) $(KEY_FILE)
	docker compose -f $(YAML_FILE) up -d --build

clean: $(YAML_FILE) $(ENV_FILE) $(CERT_FILE) $(KEY_FILE)
	docker compose -f $(YAML_FILE) down

fclean: $(YAML_FILE) $(ENV_FILE) $(CERT_FILE) $(KEY_FILE)
	docker compose -f $(YAML_FILE) down --rmi all

re: $(YAML_FILE) $(ENV_FILE) $(CERT_FILE) $(KEY_FILE)
	$(MAKE) fclean
	$(MAKE) all

stop: $(YAML_FILE) $(ENV_FILE) $(CERT_FILE) $(KEY_FILE)
	docker compose -f $(YAML_FILE) stop

start: $(YAML_FILE) $(ENV_FILE) $(CERT_FILE) $(KEY_FILE)
	docker compose -f $(YAML_FILE) start
