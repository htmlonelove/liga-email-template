## [Гайд по работе со сборкой](/GUIDE.md) 📕
## [Небольшой кодгайд по Pug](https://github.com/alextuboltsev/pug-codeguide) 📗

## Краткая инструкция по работе
Для начала работы у вас должен быть установлен **Node.js** 14 версии<br>
CSS собираются в папке build и переносятся в тег style (styleForStyleTag) и инлайново (styleForInline) во все html файлы в папке build. 
## Обязательно прочитайте how-to-markup-emails.html, там описаны важные моменты верстки писем.

### Основные команды для работы
- Установка - `npm i`
- Запуск локального сервера - `npm start`
- Сборка проекта и оптимизация изображений перед отдачей клиенту - `npm run build`

### Вся разработка ведётся в директории `source`
### Итоговый код попадает в директорию `build`
