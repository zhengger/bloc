import 'dart:convert';

import 'package:meta/meta.dart';
import 'package:uuid/uuid.dart';
import 'package:bloc/bloc.dart';
import 'package:web_socket_channel/io.dart';

class DevSnapshot {
  final Transition transition;
  final Bloc bloc;

  const DevSnapshot({this.transition, this.bloc});
}

class DevBlocDelegate extends BlocDelegate {
  IOWebSocketChannel channel;
  final Map<String, DevSnapshot> _blocMap = Map<String, DevSnapshot>();

  DevBlocDelegate({@required int port}) : assert(port != null) {
    channel = IOWebSocketChannel.connect("ws://localhost:$port");
    print('DevBlocDelegate()');
    channel.stream.listen((dynamic event) {
      final Map<String, dynamic> map = json.decode(event as String);
      final String uuid = map['uuid'].toString();
      final Transition transition = _blocMap[uuid].transition;
      final Bloc bloc = _blocMap[uuid].bloc;
      bloc.currentState = transition.nextState;
    });
  }

  @override
  void onTransition(Bloc bloc, Transition transition) {
    final String uuid = Uuid().v1();
    _blocMap[uuid] = DevSnapshot(bloc: bloc, transition: transition);

    channel.sink.add(
      '''{
        "currentState": "${transition.currentState}",
        "event": "${transition.event}",
        "nextState": "${transition.nextState}",
        "timestamp":  ${DateTime.now().millisecondsSinceEpoch},
        "uuid": "$uuid"
      }''',
    );
  }
}
