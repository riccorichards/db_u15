"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface Zone {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  hoverColor: string;
  principles: { title: string; points: string[] }[];
  playerRoles: string;
  keyPhrase: string;
}

const ZONES: Zone[] = [
  // ── DEFENSIVE THIRD ──
  {
    id: "gk_zone",
    label: "მეკარის ზონა",
    shortLabel: "მეკ",
    x: 35,
    y: 2,
    w: 30,
    h: 13,
    color: "rgba(1,138,190,0.15)",
    hoverColor: "rgba(1,138,190,0.35)",
    playerRoles: "მეკარე",
    keyPhrase: "ბურთის განაწილება შენი პირველი შეტევაა",
    principles: [
      {
        title: "განაწილება",
        points: [
          "ყოველი განახლება შეტევის დაწყების შანსია",
          "მიღებამდე ყოველთვის შეამოწმე სივრცე — იცოდე ვარიანტები",
          "მოკლე პასი ცმ-ზე ზრდის წნეხს, გრძელი პასი ხსნის წნეხს",
          "არასდროს იყოყმანო — ნელი განაწილება კლავს ტემპს",
        ],
      },
      {
        title: "კომუნიკაცია",
        points: [
          "მუდმივად აკონტროლე დაცვის ხაზის სიმაღლე",
          "დაიძახე ხმამაღლა და დროულად 'ჩემია' ან 'გაიტანე'",
          "იყავი დაცვის თვალები — შენ ყველაფერს ხედავ",
          "სტანდარტულები: აიღე ინიციატივა, თავად განალაგე ცოცხალი კედელი",
        ],
      },
    ],
  },
  {
    id: "cb_left",
    label: "მარცხენა ცენტრალური მცველი",
    shortLabel: "ცმ მარცხ",
    x: 2,
    y: 15,
    w: 28,
    h: 18,
    color: "rgba(2,69,122,0.25)",
    hoverColor: "rgba(2,69,122,0.5)",
    playerRoles: "ცენტრალური მცველი (მარცხენა)",
    keyPhrase: "წაიღე წინ, თუ ხაზი ღიაა",
    principles: [
      {
        title: "შეტევის დაწყება (Build-Up)",
        points: [
          "მიიღე ბურთი მეკარისგან ღია კორპუსით — ყოველთვის იყურე წინ",
          "თუ წნეხის ქვეშ ხარ, დაუბრუნე მეკარეს. არასდროს გარისკო.",
          "წაიღე ბურთი წინ, როცა სივრცე გაძლევს საშუალებას — იყავი თამამი",
          "გადაიტანე თამაში საპირისპირო ცმ-ზე ბლოკის გადასაადგილებლად",
        ],
      },
      {
        title: "დაცვითი მოვალეობები",
        points: [
          "არასდროს დარჩე ძალიან წინ — დააზღვიე ფლანგის მცველის უკან",
          "ბურთის მოსაპოვებლად გადი მხოლოდ მაშინ, თუ 100%-ით დარწმუნებული ხარ",
          "თუ ეჭვი გეპარება, შეაფერხე და მიყევი. არ ამოვარდე.",
          "შეათანხმე ხელოვნური თამაშგარე სხვა ცმ-სთან",
        ],
      },
    ],
  },
  {
    id: "cb_right",
    label: "მარჯვენა ცენტრალური მცველი",
    shortLabel: "ცმ მარჯვ",
    x: 70,
    y: 15,
    w: 28,
    h: 18,
    color: "rgba(2,69,122,0.25)",
    hoverColor: "rgba(2,69,122,0.5)",
    playerRoles: "ცენტრალური მცველი (მარჯვენა)",
    keyPhrase: "არასდროს გააკეთო ბრმა პასი შენს საჯარიმოში",
    principles: [
      {
        title: "შეტევის დაწყება (Build-Up)",
        points: [
          "მიიღე ღია კორპუსით — ყოველთვის იცოდე შენი შემდეგი მოქმედება",
          "ეცადე ითამაშო საყრდენზე ან გადაიტანო მეორე ცმ-ზე",
          "შედი ნახევარდაცვაში, თუ პრესინგის ხაზი იხევს უკან",
          "შექმენი 3v2 ან 3v1 ბილდ-აფში, განლაგდი ფართოდ",
        ],
      },
      {
        title: "დაცვითი მოვალეობები",
        points: [
          "აკონტროლე სიღრმიდან წამოსული ნახევარმცველების გარბენები",
          "კომუნიკაცია იქონიე ფლანგის მცველთან დამზღვევ გარბენებზე",
          "როცა მეტოქე გრძელ პასს აკეთებს — მოიგე თავური აგრესიულად",
          "იმოქმედე როგორც ლიბერომ დაცვის ხაზის უკან",
        ],
      },
    ],
  },
  // ── LEFT HALF-SPACE DEEP ──
  {
    id: "left_hspace_deep",
    label: "მარცხენა ფლანგი (დაცვითი)",
    shortLabel: "მარცხ მც",
    x: 2,
    y: 33,
    w: 18,
    h: 18,
    color: "rgba(0,27,72,0.3)",
    hoverColor: "rgba(0,27,72,0.55)",
    playerRoles: "ფლანგის მცველი (მარცხენა)",
    keyPhrase: "შეინარჩუნე კომპაქტურობა — არ აიწიო ძალიან მაღლა",
    principles: [
      {
        title: "დაცვის ფაზა",
        points: [
          "შეინარჩუნე კომპაქტურობა — პირველ რიგში დაცვითი ფორმაცია",
          "დააზღვიე სივრცე გარემარბის უკან, როცა ის წინ მიდის",
          "თუ პრესინგში მოყევი ფლანგზე, დაუბრუნე ცმ-ს — არ გარისკო",
          "აკონტროლე მეტოქის გარემარბის მოძრაობა ცენტრისკენ",
        ],
      },
      {
        title: "შეტევის ფაზა",
        points: [
          "სწორად შეარჩიე ოვერლაპის დრო — გაიქეცი, როცა გარემარბს აქვს ბურთი",
          "შექმენი 2v1 ფლანგზე გარემარბთან ერთად",
          "ჩაწოდებამდე ჩადი ბოლო ხაზამდე",
          "თუ ოვერლაპი არ გამოდის, გააკეთე ანდერლაპი ნახევარსივრცეში",
        ],
      },
    ],
  },
  {
    id: "right_hspace_deep",
    label: "მარჯვენა ფლანგი (დაცვითი)",
    shortLabel: "მარჯვ მც",
    x: 80,
    y: 33,
    w: 18,
    h: 18,
    color: "rgba(0,27,72,0.3)",
    hoverColor: "rgba(0,27,72,0.55)",
    playerRoles: "ფლანგის მცველი (მარჯვენა)",
    keyPhrase: "დააზღვიე სივრცე გარემარბის უკან",
    principles: [
      {
        title: "დაცვის ფაზა",
        points: [
          "წაიკითხე თამაში — როდის უნდა გაჩერდე და როდის გახვიდე წინ",
          "არასდროს წახვიდეთ ორივე ფლანგის მცველი წინ ერთდროულად",
          "თუ გარემარბი იზოლირებულია, შეიწიე ცენტრისკენ 5-კაციანი ხაზის შესაქმნელად",
          "ცმ-სთან კომუნიკაცია სასიცოცხლოდ მნიშვნელოვანია",
        ],
      },
      {
        title: "შეტევის ფაზა",
        points: [
          "სწორად შეარჩიე სივრცეში შესვლის დრო — დაელოდე სიგნალს",
          "შეასრულე ხარისხიანი ჩაწოდებები შორეული ძელისკენ",
          "დაარტყა თუ ჩააწოდო — სწორად წაიკითხე სიტუაცია საჯარიმოში",
          "შეიწიე ცენტრში, თუ ფლანგი ჩაკეტილია — შექმენი კუთხეები",
        ],
      },
    ],
  },
  // ── HALF-SPACES MIDDLE ──
  {
    id: "left_halfspace_mid",
    label: "მარცხენა ნახევარსივრცე",
    shortLabel: "მარცხ 8",
    x: 20,
    y: 33,
    w: 20,
    h: 18,
    color: "rgba(1,138,190,0.2)",
    hoverColor: "rgba(1,138,190,0.4)",
    playerRoles: "ნახევარმცველი (მარცხენა 8-იანი)",
    keyPhrase: "აქ იგება და აგებენ თამაშებს",
    principles: [
      {
        title: "რატომაა ნახევარსივრცეები მნიშვნელოვანი",
        points: [
          "ნახევარსივრცეები ყველაზე სახიფათო ზონებია — ხაზებს შორის",
          "აქ ბურთის მიღება აიძულებს 2 მცველს გამოვიდეს პოზიციიდან",
          "მიღებისთანავე შემოტრიალდი წინ",
          "მუდმივად შექმენი სამკუთხედები გარემარბთან და ფლანგის მცველთან",
        ],
      },
      {
        title: "მოძრაობის პატერნები",
        points: [
          "მესამე კაცის კომბინაცია — დატოვე, შემობრუნდი, დაიბრუნე",
          "შეიპარე ნახევარსივრცეში დაგვიანებით — გააკვირვე დაცვა",
          "დაიხიე უკან მისაღებად, შემდეგ შემოტრიალდი და წაიღე წინ",
          "თუ მეურვე გყავს, გაიყოლე მცველი და გაათავისუფლე გარემარბი",
        ],
      },
    ],
  },
  {
    id: "right_halfspace_mid",
    label: "მარჯვენა ნახევარსივრცე",
    shortLabel: "მარჯვ 8",
    x: 60,
    y: 33,
    w: 20,
    h: 18,
    color: "rgba(1,138,190,0.2)",
    hoverColor: "rgba(1,138,190,0.4)",
    playerRoles: "ნახევარმცველი (მარჯვენა 8-იანი)",
    keyPhrase: "მიიღე ხაზებს შორის — ყოველთვის იყურე წინ",
    principles: [
      {
        title: "რატომაა ნახევარსივრცეები მნიშვნელოვანი",
        points: [
          "8-იანის საუკეთესო სამუშაო ნახევარსივრცეში სრულდება",
          "ერთი შეხებით კომბინაციები არღვევს დაცვით ბლოკებს",
          "იყავი არაპროგნოზირებადი — არ იდგე ყოველთვის ერთსა და იმავე პოზიციაზე",
          "ნახევარსივრცეში შესული პასი ჭრის დაცვის ორ ხაზს",
        ],
      },
      {
        title: "გოლის გატანა ნახევარსივრციდან",
        points: [
          "დაგვიანებული შესვლა საჯარიმოში ნახევარსივრციდან = გოლის საფრთხე",
          "წაიღე სიღრმიდან დასარტყამ პოზიციაზე",
          "მოძებნე გარემარბის 'ქათბექი' (cut-back) ამ ზონაში",
          "თუ სივრცე გაიხსნა — დაარტყი პირველივე შეხებით, არ იყოყმანო",
        ],
      },
    ],
  },
  // ── PIVOT ──
  {
    id: "pivot_zone",
    label: "საყრდენი ზონა",
    shortLabel: "6",
    x: 40,
    y: 33,
    w: 20,
    h: 18,
    color: "rgba(151,202,219,0.15)",
    hoverColor: "rgba(151,202,219,0.3)",
    playerRoles: "საყრდენი ნახევარმცველი (6)",
    keyPhrase: "აკონტროლე ტემპი — შენ გუნდის გულისცემა ხარ",
    principles: [
      {
        title: "პოზიციური როლი",
        points: [
          "ყოველთვის იყავი ხელმისაწვდომი — გამოსავალი პრესინგის დროს",
          "არასდროს მიიღო ბურთი ზურგით საკუთარი კარისკენ",
          "გამჭოლი პასები მეტოქის ნახევარდაცვის ხაზებს შორის",
          "აკონტროლე ტემპი — შეანელე ან ააჩქარე თამაში აქედან",
        ],
      },
      {
        title: "დაცვითი მოვალეობები",
        points: [
          "გადაკეტე სივრცე ორი ცენტრალური მცველის წინ",
          "შეაფასე, როდის უნდა გახვიდე პრესინგზე და როდის შეინარჩუნო პოზიცია",
          "დააზღვიე, როცა ფლანგის მცველები წინ მიდიან",
          "მოიგე მეორე ბურთები — მიდი ადრე ნებისმიერ უმისამართო ბურთზე",
        ],
      },
    ],
  },
  // ── WIDE ATTACKING ──
  {
    id: "left_wide_att",
    label: "მარცხენა ფრთა",
    shortLabel: "მარცხ გარ",
    x: 2,
    y: 51,
    w: 18,
    h: 18,
    color: "rgba(0,27,72,0.3)",
    hoverColor: "rgba(0,27,72,0.55)",
    playerRoles: "გარემარბი (მარცხენა)",
    keyPhrase: "დარჩი ფლანგზე დაცვის გასაწელად",
    principles: [
      {
        title: "სიგანე და გაწელვა",
        points: [
          "დარჩი ფლანგზე და მაღლა, რომ მცველი უკან დახიო",
          "შენი სიგანე უქმნის სივრცეს ნახევარსივრცეში მყოფ 8-იანს",
          "არ შეიწიო ცენტრში ნაადრევად — შეინარჩუნე სიგანე",
          "ერთი ერთზე: გამოიყენე სისწრაფე ან სწრაფი ფეხები გასაცდენად",
        ],
      },
      {
        title: "მოქმედებები შეტევის მესამედში",
        points: [
          "ჩადი ბოლო ხაზამდე — 'ქათბექი' პრიორიტეტია",
          "მოძებნე საჯარიმოში შემომავალი 8-იანი შორეულ ძელზე",
          "თუ დაგიბლოკეს — შეცვალე მიმართულება, არ ჩააწოდო ძალადობრივად",
          "მარცხნიდან ცენტრში შეწევა და დარტყმა ძალიან სახიფათოა",
        ],
      },
    ],
  },
  {
    id: "right_wide_att",
    label: "მარჯვენა ფრთა",
    shortLabel: "მარჯვ გარ",
    x: 80,
    y: 51,
    w: 18,
    h: 18,
    color: "rgba(0,27,72,0.3)",
    hoverColor: "rgba(0,27,72,0.55)",
    playerRoles: "გარემარბი (მარჯვენა)",
    keyPhrase: "შექმენი 1v1 — გაიყვანე მცველები ფლანგზე",
    principles: [
      {
        title: "სიგანე და გაწელვა",
        points: [
          "შენი საქმეა მოედანი მაქსიმალურად ფართო გახადო",
          "აიძულე მცველი აირჩიოს: შენ დაგიჭიროს თუ ცენტრი დააზღვიოს",
          "იკომბინაციე ფლანგის მცველთან 2v1 სიტუაციების შესაქმნელად",
          "ტემპის ცვლილება შენი ყველაზე დიდი იარაღია",
        ],
      },
      {
        title: "მოქმედებები შეტევის მესამედში",
        points: [
          "შეიწიე ცენტრში მარცხენა ფეხზე დასარტყამად ან გამჭოლი პასისთვის",
          "მცველის ოვერლაპი — გამოიყენე ის როგორც სატყუარა",
          "ჩააწოდე ახლო ძელზე თავდამსხმელისთვის",
          "თუ რიცხობრივ უმცირესობაში ხარ — დაუბრუნე ბურთი ცენტრში 8-იანს",
        ],
      },
    ],
  },
  // ── ATTACKING HALF-SPACES ──
  {
    id: "left_hspace_att",
    label: "მარცხენა შემტევი ნახევარსივრცე",
    shortLabel: "შემტ მარცხ",
    x: 20,
    y: 51,
    w: 20,
    h: 18,
    color: "rgba(1,138,190,0.25)",
    hoverColor: "rgba(1,138,190,0.45)",
    playerRoles: "შემტევი 8-იანი (მარცხენა)",
    keyPhrase: "დაიგვიანე შესვლა — გააკვირვე დაცვა",
    principles: [
      {
        title: "გოლის საფრთხე",
        points: [
          "ყველაზე სახიფათო ზონა შემტევი 8-იანისთვის",
          "დაგვიანებული გარბენი სიღრმიდან ქმნის მოულოდნელობას — დრო ზუსტად შეარჩიე",
          "დაბალი ჩაწოდება ან ქათბექი აქედან = მაღალი შანსის მომენტი",
          "დაარტყი დანახვისთანავე, თუ მეკარე პოზიციას კარგავს",
        ],
      },
      {
        title: "კომბინაციური თამაში",
        points: [
          "შენს უკან მცველის ოვერლაპი ქმნის რიცხობრივ უპირატესობას",
          "კედელი თავდამსხმელთან ზურგს უკან შესაღწევად",
          "ცრუ მოძრაობა (Dummy run) თავდამსხმელისთვის სივრცის გასახსნელად",
          "შეაჩერე გარბენი — არ წახვიდე ადრე და არ ჩარჩე თამაშგარეში",
        ],
      },
    ],
  },
  {
    id: "right_hspace_att",
    label: "მარჯვენა შემტევი ნახევარსივრცე",
    shortLabel: "შემტ მარჯვ",
    x: 60,
    y: 51,
    w: 20,
    h: 18,
    color: "rgba(1,138,190,0.25)",
    hoverColor: "rgba(1,138,190,0.45)",
    playerRoles: "შემტევი 8-იანი (მარჯვენა)",
    keyPhrase: "დაბალი ჩაწოდება ან ქათბექი აქედან",
    principles: [
      {
        title: "გოლის საფრთხე",
        points: [
          "დიაგონალური გარბენი ამ ზონაში ნახევარდაცვიდან = ძალიან რთული დასაჭერია",
          "დაარტყი დაბლა მეკარის საპირისპიროდ, როცა შესაძლებელია",
          "დაუგდე ბურთი უკნიდან მომავალ ნახევარმცველს დასარტყამად",
          "არ გაართულო — გამოიყენე პირველივე შანსი",
        ],
      },
      {
        title: "რიცხობრივი უპირატესობის შექმნა",
        points: [
          "გამოიყვანე ერთი ცმ პოზიციიდან ფორვარდის ზონის გასახსნელად",
          "იკომბინაციე სწრაფად — მაქსიმუმ ორი შეხება ვიწრო სივრცეებში",
          "თუ მცველი აკეთებს ოვერლაპს — გააყოლე ბურთი",
          "დაიხიე უკან თუ გადაკეტილი ხარ — არ დაკარგო ბურთი აქ",
        ],
      },
    ],
  },
  // ── STRIKER ZONE ──
  {
    id: "striker_zone",
    label: "თავდამსხმელის ზონა (9)",
    shortLabel: "9",
    x: 40,
    y: 51,
    w: 20,
    h: 18,
    color: "rgba(214,232,238,0.1)",
    hoverColor: "rgba(214,232,238,0.25)",
    playerRoles: "თავდამსხმელი (9)",
    keyPhrase: "ყოველთვის იყავი ორ ცენტრალურ მცველს შორის",
    principles: [
      {
        title: "ბურთის დაჭერა (Hold-Up)",
        points: [
          "დაიჭირე ბურთი ზურგით კარისკენ — მიეცი დრო თანაგუნდელებს",
          "თავით გადაგდება და დატოვება მომავალი 8-იანებისთვის",
          "ჩამოდი უკან მისაღებად — შემდეგ შემოტრიალდი და წადი წინ",
          "გამოიყენე სხეული ფარად — დაიცავი ბურთი",
        ],
      },
      {
        title: "მოძრაობა და დაგვირგვინება",
        points: [
          "მუდმივი მოძრაობა — არასდროს იდგე ერთ ადგილას",
          "ახლო ძელზე + შორეულ ძელზე გარბენი ცმ-ების გასაყოფად",
          "შეიპარე საჯარიმოში დაგვიანებით — დაამთხვიე გარბენი ჩაწოდებას",
          "მეორე ბურთის მენტალიტეტი — ყოველთვის ელოდე დამატებას",
        ],
      },
    ],
  },
  // ── PENALTY BOX ──
  {
    id: "penalty_box",
    label: "საჯარიმო მოედანი",
    shortLabel: "საჯ",
    x: 25,
    y: 69,
    w: 50,
    h: 18,
    color: "rgba(214,232,238,0.08)",
    hoverColor: "rgba(214,232,238,0.2)",
    playerRoles: "შემტევები",
    keyPhrase: "დაიგვიანე შესვლა — არ იდგე და არ ელოდო",
    principles: [
      {
        title: "საჯარიმოში შესვლის წესები",
        points: [
          "შედი საჯარიმოში მხოლოდ მაშინ, როცა ბურთი ფლანგზეა და ჩაწოდება მოდის",
          "შეიპარე დაგვიანებით სიღრმიდან — გაიქეცი სწორ მომენტში",
          "არასდროს იდგე საჯარიმოში ლოდინის რეჟიმში — ამოგიკეტავენ",
          "ორი მორბენალი: ახლო ძელი + შორეული ძელი — გაყავით ცმ-ები",
        ],
      },
      {
        title: "დაგვირგვინების პრინციპები",
        points: [
          "იმოქმედე მარტივად — დაარტყი დაბლა და მეკარის საპირისპიროდ",
          "მეორე ბურთის მენტალიტეტი — მეკარე იგერიებს, შენ მზად ხარ",
          "არ იზეიმო ნაადრევად — მიყევი ყველა დარტყმას ბოლომდე",
          "შორეულ ძელზე ცარიელ კარში გატანა ფეხბურთში ყველაზე დაუფასებელი გოლია",
        ],
      },
    ],
  },
];

const GLOBAL_PRINCIPLES = [
  {
    title: "პოზიციური უპირატესობა",
    desc: "ყოველთვის იყავი ბურთის მისაღებ პოზიციაზე. თუ ვერ იღებ, იმოძრავე.",
  },
  {
    title: "3-წამის წესი",
    desc: "გადაწყვეტილება უნდა მიიღო ბურთის მიღებამდე. იფიქრე წინასწარ.",
  },
  {
    title: "სამკუთხედის მხარდაჭერა",
    desc: "ყოველთვის მიეცი ბურთიან მოთამაშეს 2 პასის ვარიანტი — ერთი მოკლე, ერთი დიაგონალური.",
  },
  {
    title: "პრესინგის ტრიგერები",
    desc: "მიმართეთ პრესინგს გუნდურად როცა: ცუდი შეხებაა, უკან პასია მეკარეზე, ან მეტოქემ დაკარგა ბურთი საკუთარ ნახევარზე.",
  },
  {
    title: "კომპაქტურობა",
    desc: "მაქსიმუმ 25 მეტრი თქვენს დაცვით და შემტევ ხაზებს შორის ნებისმიერ დროს.",
  },
  {
    title: "გადაჯგუფება",
    desc: "თუ ეჭვი გეპარება, დააბრუნე უკან და თავიდან დაიწყე. ცუდი პასი წინ უფრო უარესია, ვიდრე პასი უკან.",
  },
];

export default function TacticsPitch() {
  const [activeZone, setActiveZone] = useState<Zone | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      {/* Pitch */}
      <div className="glass rounded-2xl p-4 overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: "130%" }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 90"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Pitch background */}
            <rect x="0" y="0" width="100" height="90" fill="#0a2010" rx="2" />

            {/* Grass stripes */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <rect
                key={i}
                x="0"
                y={i * 10}
                width="100"
                height="10"
                fill={i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
              />
            ))}

            {/* Pitch outline */}
            <rect
              x="2"
              y="2"
              width="96"
              height="86"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
            />

            {/* Centre line */}
            <line
              x1="2"
              y1="45"
              x2="98"
              y2="45"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
            />

            {/* Centre circle */}
            <circle
              cx="50"
              cy="45"
              r="9"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.5"
            />
            <circle cx="50" cy="45" r="0.7" fill="rgba(255,255,255,0.4)" />

            {/* Penalty areas */}
            <rect
              x="22"
              y="2"
              width="56"
              height="16"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.4"
            />
            <rect
              x="22"
              y="72"
              width="56"
              height="16"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="0.4"
            />

            {/* Goal areas */}
            <rect
              x="35"
              y="2"
              width="30"
              height="6"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.4"
            />
            <rect
              x="35"
              y="82"
              width="30"
              height="6"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="0.4"
            />

            {/* Goals */}
            <rect
              x="40"
              y="0"
              width="20"
              height="2"
              fill="rgba(255,255,255,0.15)"
            />
            <rect
              x="40"
              y="88"
              width="20"
              height="2"
              fill="rgba(255,255,255,0.15)"
            />

            {/* Zone blocks */}
            {ZONES.map((zone) => (
              <g
                key={zone.id}
                onClick={() =>
                  setActiveZone(activeZone?.id === zone.id ? null : zone)
                }
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  fill={
                    activeZone?.id === zone.id ? zone.hoverColor : zone.color
                  }
                  stroke={
                    activeZone?.id === zone.id
                      ? "rgba(151,202,219,0.6)"
                      : "rgba(151,202,219,0.15)"
                  }
                  strokeWidth="0.4"
                  rx="0.5"
                  className="transition-all duration-200"
                />
                {/* Zone label */}
                <text
                  x={zone.x + zone.w / 2}
                  y={zone.y + zone.h / 2 - 1}
                  textAnchor="middle"
                  fill={
                    activeZone?.id === zone.id
                      ? "white"
                      : "rgba(151,202,219,0.7)"
                  }
                  fontSize="2.8"
                  fontFamily="Barlow Condensed"
                  fontWeight="700"
                >
                  {zone.shortLabel}
                </text>
                <text
                  x={zone.x + zone.w / 2}
                  y={zone.y + zone.h / 2 + 2.5}
                  textAnchor="middle"
                  fill="rgba(151,202,219,0.4)"
                  fontSize="1.8"
                  fontFamily="DM Sans"
                >
                  {zone.playerRoles.split(" ")[0]}
                </text>
              </g>
            ))}

            {/* Direction arrow */}
            <text
              x="50"
              y="88.5"
              textAnchor="middle"
              fill="rgba(255,255,255,0.2)"
              fontSize="2"
              fontFamily="DM Sans"
            >
              შეტევის მიმართულება ↑
            </text>
          </svg>
        </div>
      </div>

      {/* Info panel */}
      <div className="space-y-4">
        {/* Zone detail */}
        {activeZone ? (
          <div className="glass-bright rounded-2xl p-5 border border-ocean/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-sky/50 uppercase tracking-widest">
                    ზონა
                  </span>
                </div>
                <h2 className="font-display text-2xl font-black text-white uppercase">
                  {activeZone.label}
                </h2>
                <p className="text-xs text-sky/50 font-mono mt-0.5">
                  {activeZone.playerRoles}
                </p>
              </div>
              <button
                onClick={() => setActiveZone(null)}
                className="glass rounded-lg w-8 h-8 flex items-center justify-center text-sky/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Key phrase */}
            <div className="glass rounded-xl px-4 py-3 mb-4 border-l-2 border-ocean">
              <p className="text-ocean font-display text-lg font-bold">
                &ldquo;{activeZone.keyPhrase}&rdquo;
              </p>
            </div>

            {/* Principles */}
            <div className="space-y-4">
              {activeZone.principles.map((section) => (
                <div key={section.title}>
                  <h4 className="font-display font-bold text-sm uppercase tracking-wider text-sky mb-2">
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-ocean font-mono text-xs mt-0.5 flex-shrink-0">
                          {i + 1}.
                        </span>
                        <span className="text-sm font-body text-mist/80">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 h-48">
            <div className="w-10 h-10 rounded-2xl bg-ocean/20 flex items-center justify-center">
              <span className="text-ocean font-display font-black text-lg">
                ?
              </span>
            </div>
            <div>
              <p className="text-white font-display font-bold">
                დააკლიკეთ მოედნის ნებისმიერ ზონას
              </p>
              <p className="text-sky/40 text-sm font-body mt-1">
                პრინციპებისა და მოთამაშის როლების სანახავად
              </p>
            </div>
          </div>
        )}

        {/* Global principles */}
        <div className="glass rounded-2xl p-5">
          <h3 className="font-display text-base font-bold uppercase tracking-wider text-white mb-3">
            უნივერსალური პრინციპები
          </h3>
          <div className="space-y-3">
            {GLOBAL_PRINCIPLES.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-ocean mt-1.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-mono text-sky font-bold">
                    {p.title} —{" "}
                  </span>
                  <span className="text-xs font-body text-mist/60">
                    {p.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
