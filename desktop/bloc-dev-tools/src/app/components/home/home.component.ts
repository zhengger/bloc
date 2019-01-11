import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';

import { TransitionService, ElectronService } from '../../providers';
import { Transition } from '../../models';
import { convertMilliseconds } from '../../utils';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private transitionSubscription: Subscription;
  private currentTimestamp: number;
  private activeTransitionIndex = 0;
  transitions: Transition[] = [];
  port: number;

  constructor(
    private electronService: ElectronService,
    private transitionService: TransitionService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.electronService.ipcRenderer.on('port', (event: any, args: string) => {
      console.log('port', args);
      this.zone.run(() => {
        this.port = parseInt(args, 10);
      });
    });
    this.electronService.ipcRenderer.send('fetchPort');
    this.transitionSubscription = this.transitionService.transitions.subscribe(
      transition => {
        if (typeof this.currentTimestamp === 'undefined') {
          this.currentTimestamp = transition.timestamp;
          transition.timestamp = '+00:00.00';
        } else {
          transition.timestamp = convertMilliseconds(
            transition.timestamp - this.currentTimestamp
          );
        }
        this.zone.run(() => {
          this.transitions.push(transition);
          this.activeTransitionIndex = this.transitions.length - 1;
        });
      }
    );
  }

  ngOnDestroy() {
    this.transitionSubscription.unsubscribe();
  }

  onSelected(index: number) {
    if (index === this.activeTransitionIndex) {
      return;
    }

    this.activeTransitionIndex = index;
  }

  onJump(index: number) {
    this.transitionService.dispatch(this.transitions[index]);
  }

  onClearAll() {
    this.transitions = [];
    this.currentTimestamp = undefined;
  }
}
