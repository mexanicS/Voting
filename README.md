Smart contract for creating a vote.

1) Создать голосование может только создатель контракта.
2) Добавлять кандидатов могут все пользователи. Для этого нужно выбрать голосование в которое вы хотите добавить кандидата, написать имя и его адрес.
3) Проголосовать может любой, но только один раз в одном голосовании (голосование анонимное).
4) Чтобы проголосовать необходимо внести минимум 0.01 ETH, и выбрать кандидата по его порядковому номеру. Номер можно посмотреть выполнив функцию listCandidate.
5) По истечению 3 дней, у любого пользоваетля появляется возможность завершить голосование и после этого определяется победитель (кандидат набравший наибольшее кол-во голосов) и получает все накопленные ETH с вычетом комиссии.
6) Комиссия остается на платформе, ее может выводить только создатель контракта на определенный адресюъ.
7) Можно создать одно и более голосований одновременно. Информация о прошедших голосованиях сохраняется и всегда доступна.

Результаты тестов (не полное покрытие):
![image](https://user-images.githubusercontent.com/62372987/161037002-f7f1ff1c-9797-4fbe-b4a1-5d1b4475987c.png)

Результат работы deploy.js в сети rinkeby:
![image](https://user-images.githubusercontent.com/62372987/161035378-e86e4355-1510-4dd9-a32f-ef5f9b548e2f.png)

