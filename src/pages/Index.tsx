import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const hotels = [
  {
    id: 1,
    name: 'Гранд Отель Чувашия',
    rating: 4.8,
    reviews: 342,
    price: 4500,
    image: 'https://cdn.poehali.dev/projects/112e496c-3a18-4cac-9bdf-d0dcd6431fa4/files/bcfa7b10-8c9e-4fc9-bfbf-af4459829e89.jpg',
    location: 'Центр города',
    amenities: ['Wi-Fi', 'Парковка', 'Ресторан', 'Спа'],
    description: 'Роскошный отель в самом сердце Чебоксар с великолепным видом на Волгу',
    rooms: [
      { type: 'Стандарт', price: 4500, size: 28 },
      { type: 'Люкс', price: 7200, size: 42 },
      { type: 'Президент', price: 12000, size: 68 }
    ]
  },
  {
    id: 2,
    name: 'Ривьера Бутик-Отель',
    rating: 4.6,
    reviews: 218,
    price: 3800,
    image: 'https://cdn.poehali.dev/projects/112e496c-3a18-4cac-9bdf-d0dcd6431fa4/files/d6c479a8-6fef-459c-b309-215c9b383985.jpg',
    location: 'Набережная',
    amenities: ['Wi-Fi', 'Завтрак', 'Фитнес'],
    description: 'Современный бутик-отель на берегу Волги с панорамными окнами',
    rooms: [
      { type: 'Стандарт', price: 3800, size: 24 },
      { type: 'Делюкс', price: 5500, size: 35 }
    ]
  },
  {
    id: 3,
    name: 'Атлантис Сити',
    rating: 4.7,
    reviews: 456,
    price: 5200,
    image: 'https://cdn.poehali.dev/projects/112e496c-3a18-4cac-9bdf-d0dcd6431fa4/files/baeb2b05-fbea-49f4-8c04-72add71da39a.jpg',
    location: 'Деловой район',
    amenities: ['Wi-Fi', 'Парковка', 'Бассейн', 'Конференц-зал'],
    description: 'Современный бизнес-отель с отличной инфраструктурой',
    rooms: [
      { type: 'Стандарт', price: 5200, size: 30 },
      { type: 'Бизнес', price: 6800, size: 38 }
    ]
  }
];

const Index = () => {
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [priceRange, setPriceRange] = useState([3000, 15000]);
  const [selectedHotel, setSelectedHotel] = useState<typeof hotels[0] | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  const filteredHotels = hotels.filter(h => h.price >= priceRange[0] && h.price <= priceRange[1]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Icon name="Hotel" className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Отели Чебоксар
            </h1>
          </div>
          <Button variant="outline" className="gap-2">
            <Icon name="User" size={18} />
            Войти
          </Button>
        </div>
      </header>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Найдите идеальный отель
            </h2>
            <p className="text-lg text-muted-foreground">
              Лучшие предложения для вашего комфортного отдыха в Чебоксарах
            </p>
          </div>

          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur animate-scale-in">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-14">
                      <Icon name="Calendar" className="mr-2" size={18} />
                      {checkIn ? format(checkIn, 'dd MMM', { locale: ru }) : 'Заезд'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-14">
                      <Icon name="Calendar" className="mr-2" size={18} />
                      {checkOut ? format(checkOut, 'dd MMM', { locale: ru }) : 'Выезд'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button className="h-14 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all">
                  <Icon name="Search" className="mr-2" size={18} />
                  Найти
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-64 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="SlidersHorizontal" size={20} />
                    Фильтры
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Цена за ночь: {priceRange[0]} - {priceRange[1]} ₽
                    </label>
                    <Slider
                      min={1000}
                      max={20000}
                      step={500}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-2"
                    />
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium mb-3 block">Рейтинг</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Любой" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Любой</SelectItem>
                        <SelectItem value="4.5">4.5+ звезд</SelectItem>
                        <SelectItem value="4.0">4.0+ звезд</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium mb-3 block">Удобства</label>
                    <div className="space-y-2">
                      {['Wi-Fi', 'Парковка', 'Бассейн', 'Спа', 'Ресторан'].map(a => (
                        <label key={a} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{a}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <main className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  Найдено {filteredHotels.length} отелей
                </h3>
                <Select defaultValue="rating">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="price-asc">Сначала дешевые</SelectItem>
                    <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6">
                {filteredHotels.map((hotel, idx) => (
                  <Card key={hotel.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="md:flex">
                      <div className="md:w-80 h-64 md:h-auto relative overflow-hidden">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary">
                          ТОП выбор
                        </Badge>
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-2xl font-bold mb-1">{hotel.name}</h4>
                            <p className="text-muted-foreground flex items-center gap-1">
                              <Icon name="MapPin" size={16} />
                              {hotel.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <Icon name="Star" size={18} className="fill-accent text-accent" />
                              <span className="text-xl font-bold">{hotel.rating}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{hotel.reviews} отзывов</p>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4">{hotel.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.map(a => (
                            <Badge key={a} variant="secondary" className="gap-1">
                              <Icon name="Check" size={14} />
                              {a}
                            </Badge>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Цена за ночь от</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                              {hotel.price.toLocaleString()} ₽
                            </p>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="lg"
                                className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                                onClick={() => setSelectedHotel(hotel)}
                              >
                                <Icon name="CalendarCheck" className="mr-2" size={18} />
                                Забронировать
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">{hotel.name}</DialogTitle>
                                <DialogDescription>{hotel.location}</DialogDescription>
                              </DialogHeader>

                              <div className="grid md:grid-cols-2 gap-4 my-4">
                                <img src={hotel.image} alt={hotel.name} className="rounded-lg w-full h-48 object-cover" />
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Star" size={18} className="fill-accent text-accent" />
                                    <span className="font-bold">{hotel.rating}</span>
                                    <span className="text-muted-foreground">({hotel.reviews} отзывов)</span>
                                  </div>
                                  <p>{hotel.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {hotel.amenities.map(a => (
                                      <Badge key={a} variant="outline">{a}</Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <Separator />

                              <div className="space-y-4 my-4">
                                <h4 className="font-bold text-lg">Выберите номер</h4>
                                <div className="grid gap-3">
                                  {hotel.rooms.map(room => (
                                    <Card
                                      key={room.type}
                                      className={cn(
                                        "cursor-pointer transition-all hover:shadow-md",
                                        selectedRoom === room.type && "ring-2 ring-primary"
                                      )}
                                      onClick={() => setSelectedRoom(room.type)}
                                    >
                                      <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <h5 className="font-semibold mb-1">{room.type}</h5>
                                            <p className="text-sm text-muted-foreground">{room.size} м²</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-2xl font-bold">{room.price.toLocaleString()} ₽</p>
                                            <p className="text-xs text-muted-foreground">за ночь</p>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 my-4">
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Дата заезда</label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-start">
                                        <Icon name="Calendar" className="mr-2" size={16} />
                                        {checkIn ? format(checkIn, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Дата выезда</label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-full justify-start">
                                        <Icon name="Calendar" className="mr-2" size={16} />
                                        {checkOut ? format(checkOut, 'dd MMMM yyyy', { locale: ru }) : 'Выберите дату'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-0">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center mb-2">
                                    <span>Выбранный номер:</span>
                                    <span className="font-semibold">{selectedRoom || 'Не выбран'}</span>
                                  </div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span>Количество ночей:</span>
                                    <span className="font-semibold">
                                      {checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0}
                                    </span>
                                  </div>
                                  <Separator className="my-3" />
                                  <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Итого:</span>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                      {selectedRoom && checkIn && checkOut
                                        ? (hotel.rooms.find(r => r.type === selectedRoom)?.price || 0) *
                                          Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
                                        : 0} ₽
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>

                              <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                                disabled={!selectedRoom || !checkIn || !checkOut}
                              >
                                Перейти к оплате
                              </Button>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                  <Icon name="Hotel" className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-xl">Отели Чебоксар</h3>
              </div>
              <p className="text-muted-foreground">Лучший сервис бронирования отелей в Чебоксарах</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Компания</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>О нас</li>
                <li>Контакты</li>
                <li>Вакансии</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Помощь</li>
                <li>FAQ</li>
                <li>Отмена бронирования</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Контакты</h4>
              <div className="space-y-2 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Icon name="Phone" size={16} />
                  +7 (8352) 123-456
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="Mail" size={16} />
                  info@hotels-cheb.ru
                </p>
              </div>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-muted-foreground">© 2026 Отели Чебоксар. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
