import { Component } from '@angular/core';

@Component({
  selector: 'app-fo-footer',
  templateUrl: './fo-footer.component.html',
  styleUrls: ['./fo-footer.component.css']
})
export class FoFooterComponent {
  readonly year = new Date().getFullYear();
}
